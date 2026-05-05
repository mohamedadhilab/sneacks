const User = require('../../models/userModel');
const bcrypt = require('bcrypt');
const sendOtpMail = require('../../utils/mail');

const {
  generateOTP,
  saveOTP,
  verifyOTP
} = require('../../utils/otpService');


// ================= SIGNUP =================
exports.signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.send('Passwords do not match');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send('User already exists');
    }

    const otp = generateOTP();
    await saveOTP(email, otp, 'signup');

    console.log("Signup OTP:", otp);

    await sendOtpMail(email, otp); // ✅ EMAIL SEND
    req.session.otpTime = Date.now();

    req.session.tempUser = { name, email, password };

    res.redirect(`/otp?email=${email}&purpose=signup`);

  } catch (error) {
    console.log(error);
    res.send('Signup error');
  }
};


// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.send('User not found');
    if (user.isBlocked) return res.send('User is blocked');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send('Invalid password');

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email
    };

    res.redirect('/home');

  } catch (error) {
    console.log(error);
    res.send('Login error');
  }
};


// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.render('user/forgot-password', { error: 'User not found' });
    }

    const otp = generateOTP();
    await saveOTP(email, otp, 'forgot');

    console.log('Forgot OTP:', otp);

    await sendOtpMail(email, otp); // ✅ EMAIL SEND
    req.session.otpTime = Date.now();

    res.redirect(`/otp?email=${email}&purpose=forgot`);

  } catch (error) {
    console.log(error);
    res.send('Forgot password error');
  }
};


// ================= OTP PAGE =================
exports.getOtpPage = (req, res) => {
  const { email, purpose } = req.query;

  res.render('user/otp', {
    email,
    purpose,
    error: null,
    otpTime: req.session.otpTime || Date.now()
  });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp, purpose } = req.body;

  const isValid = await verifyOTP(email, otp, purpose);

  if (!isValid) {
    return res.render('user/otp', {
      email,
      purpose,
      error: 'Invalid OTP'
    });
  }

  // SIGNUP
  if (purpose === 'signup') {
    const tempUser = req.session.tempUser;

    if (!tempUser) return res.send('Session expired');

    const hashedPassword = await bcrypt.hash(tempUser.password, 10);

    await User.create({
      name: tempUser.name,
      email: tempUser.email,
      password: hashedPassword
    });

    delete req.session.tempUser;

    return res.redirect('/login');
  }

  // FORGOT PASSWORD
  if (purpose === 'forgot') {
    return res.redirect(`/reset-password?email=${email}`);
  }

if (purpose === 'email-change') {

  const newEmail = req.session.newEmail;

  if (!newEmail) {
    return res.send('Session expired');
  }
  

  // 🔥 CHECK IF EMAIL ALREADY EXISTS
  const existingUser = await User.findOne({ email: newEmail });

  if (existingUser) {
    return res.render('user/otp', {
      email,
      purpose,
      error: 'Email already in use'
    });
  }

  // ✅ UPDATE EMAIL
  await User.updateOne(
    { _id: req.session.user.id },
    { $set: { email: newEmail } }
  );

  req.session.user.email = newEmail;

  delete req.session.newEmail;

  return res.redirect('/profile');
}
};


// ================= RESEND OTP =================
exports.resendOtp = async (req, res) => {
  try {
    let { email, purpose } = req.query;

    // 🔥 FIX FOR EMAIL CHANGE
    if (purpose === 'email-change') {
      email = req.session.newEmail;  
    }

    const otp = generateOTP();

    await saveOTP(email, otp, purpose);

    console.log('Resent OTP:', otp);

    await sendOtpMail(email, otp);
    req.session.otpTime = Date.now();

    res.redirect(`/otp?email=${email}&purpose=${purpose}`);

  } catch (error) {
    console.log(error);
    res.send('Resend OTP error');
  }
};


// ================= RESET PAGE =================
exports.getResetPage = (req, res) => {
  const { email } = req.query;
  res.render('user/reset-password', { email });
};


// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.send('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    res.redirect('/login');

  } catch (error) {
    console.log(error);
    res.send('Reset password error');
  }
};


// ================= LOGOUT =================
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};


// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, dob } = req.body;

    const user = await User.findById(req.session.user.id);

    if (email !== user.email) {
      const otp = generateOTP();

      await saveOTP(email, otp, 'email-change');
      await sendOtpMail(email, otp);
      req.session.otpTime = Date.now();

      req.session.newEmail = email;

      return res.redirect(`/otp?email=${email}&purpose=email-change`);
    }

    await User.updateOne(
      { _id: user._id },
      { $set: { name, phone, dob } }
    );

    res.redirect('/profile');

  } catch (error) {
    console.log(error);
    res.send('Profile update error');
  }
};


// ================= UPDATE PASSWORD =================
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(req.session.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.send("Current password is incorrect");

    if (newPassword !== confirmPassword) {
      return res.send("New passwords do not match");
    }

    if (currentPassword === newPassword) {
      return res.send("New password cannot be same as old password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne(
      { _id: req.session.user.id },
      { $set: { password: hashedPassword } }
    );

    res.redirect('/profile');

  } catch (error) {
    console.log(error);
    res.send("Update password error");
  }
};