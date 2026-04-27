const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const {
  generateOTP,
  saveOTP,
  verifyOTP
} = require('../utils/otpService');



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

    // ✅ GENERATE OTP
    const otp = generateOTP();

    // ✅ SAVE OTP WITH PURPOSE
    await saveOTP(email, otp, 'signup');

    console.log("Signup OTP:", otp);

    // ✅ STORE TEMP DATA IN SESSION
    req.session.tempUser = { name, email, password };

    // ✅ REDIRECT TO OTP PAGE
    res.redirect(`/otp?email=${email}&purpose=signup`);

  } catch (error) {
    console.log(error);
    res.send('Signup error');
  }
};

// =============================
// 🔐 LOGIN
// =============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.send('User not found');
    }

    // 2. Check blocked
    if (user.isBlocked) {
      return res.send('User is blocked');
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.send('Invalid password');
    }

    // 4. Success
    res.redirect('/home');

  } catch (error) {
    console.log(error);
    res.send('Login error');
  }
};


// =============================
// 🔑 FORGOT PASSWORD (STEP 1)
// =============================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Check user
    const user = await User.findOne({ email });
    if (!user) {
    return res.render('forgot-password', {
      error: 'User not found'
    });
    }

    // 2. Generate OTP
    const otp = generateOTP();

    // 3. Save OTP
    await saveOTP(email, otp, 'forgot');

    console.log('Forgot OTP:', otp);

    // 4. Redirect to OTP page
    res.redirect(`/otp?email=${email}&purpose=forgot`);

  } catch (error) {
    console.log(error);
    res.send('Forgot password error');
  }
};


// =============================
// 🔐 GET OTP PAGE
// =============================
exports.getOtpPage = (req, res) => {
  const { email, purpose } = req.query;

res.render('otp', { email, purpose, error: null });};


exports.verifyOtp = async (req, res) => {
  const { email, otp, purpose } = req.body;

  const isValid = await verifyOTP(email, otp, purpose);

  if (!isValid) {
    return res.render('otp', {
      email,
      purpose,
      error: 'Invalid OTP'
    });
  }

  // ✅ SIGNUP FLOW
  if (purpose === 'signup') {

    const tempUser = req.session.tempUser;

    if (!tempUser) {
      return res.send('Session expired');
    }

    const hashedPassword = await bcrypt.hash(tempUser.password, 10);

    await User.create({
      name: tempUser.name,
      email: tempUser.email,
      password: hashedPassword
    });

    // clear temp session
    delete req.session.tempUser;

    return res.redirect('/login');
  }

  // ✅ FORGOT PASSWORD
  if (purpose === 'forgot') {
    return res.redirect(`/reset-password?email=${email}`);
  }
};

// =============================
// 🔑 RESEND OTP
// =============================
exports.resendOtp = async (req, res) => {
  try {
    const { email, purpose } = req.query;

    const otp = generateOTP();

    await saveOTP(email, otp, purpose);

    console.log('Resent OTP:', otp);

    res.redirect(`/otp?email=${email}&purpose=${purpose}`);

  } catch (error) {
    console.log(error);
    res.send('Resend OTP error');
  }
};


// =============================
// 🔑 GET RESET PASSWORD PAGE
// =============================
exports.getResetPage = (req, res) => {
  const { email } = req.query;

  res.render('reset-password', { email });
};


// =============================
// 🔑 RESET PASSWORD (FINAL STEP)
// =============================
exports.resetPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // 1. Validate
    if (password !== confirmPassword) {
      return res.send('Passwords do not match');
    }

    // 2. Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Update DB
    await User.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    // 4. Redirect
    res.redirect('/login');

  } catch (error) {
    console.log(error);
    res.send('Reset password error');
  }
};


exports.logout = (req, res) => {
  res.redirect('/login');
};