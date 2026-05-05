const { generateOTP, saveOTP, verifyOTP } = require('../../utils/otpService');
const sendOtpMail = require('../../utils/mail');
const Admin = require('../../models/adminModel');
const bcrypt = require('bcrypt');
const User = require('../../models/userModel');

// ================= LOGIN PAGE =================
exports.getLogin = (req, res) => {
  res.render('admin/login', { error: null });
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.render('admin/login', { error: 'Admin not found' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.render('admin/login', { error: 'Invalid password' });
    }

    req.session.admin = {
      id: admin._id,
      email: admin.email
    };

    return res.redirect('/admin/dashboard');

  } catch (error) {
    console.log(error);
    res.send('Login error');
  }
};
exports.getDashboard = async (req, res) => {
  try {
    res.render('admin/dashboard'); // 🔥 THIS IS IMPORTANT
  } catch (error) {
    console.log(error);
    res.send('Dashboard error');
  }
};

// ================= LOGOUT =================
exports.logout = (req, res) => {
  req.session.admin = null;
  res.redirect('/admin/login');
};

// ================= FORGOT PASSWORD PAGE =================
exports.getForgotPasswordPage = (req, res) => {
  res.render('admin/forgot-password', { error: null });
};

// ================= SEND OTP =================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.render('admin/forgot-password', {
        error: 'Admin not found'
      });
    }

    const otp = generateOTP();

    await saveOTP(email, otp, 'admin-forgot');

    console.log('Admin OTP:', otp);

    await sendOtpMail(email, otp);

    // ✅ FIXED (admin route)
    return res.redirect(`/admin/otp?email=${email}&purpose=admin-forgot`);

  } catch (error) {
    console.log(error);
    res.send('Forgot password error');
  }
};

// ================= OTP PAGE =================
exports.getOtpPage = (req, res) => {
  const { email, purpose } = req.query;
  res.render('admin/otp', { email, purpose, error: null });
};

// ================= VERIFY OTP =================
exports.verifyOtp = async (req, res) => {
  let { email, otp, purpose } = req.body;

  otp = otp.toString().trim(); // 🔥 FIX

  const isValid = await verifyOTP(email, otp, purpose);

  if (!isValid) {
    return res.render('admin/otp', {
      email,
      purpose,
      error: 'Invalid OTP'
    });
  }

  if (purpose === 'admin-forgot') {
    return res.redirect(`/admin/reset-password?email=${email}`);
  }
};

// ================= RESET PAGE =================
exports.getResetPage = (req, res) => {
  const { email } = req.query;
  res.render('admin/reset-password', { email });
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.send('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    return res.redirect('/admin/login');

  } catch (error) {
    console.log(error);
    res.send('Reset password error');
  }
};


exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.render('admin/users', { users });

  } catch (error) {
    console.log(error);
    res.send('User page error');
  }
};

exports.blockUser = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.params.id },
      { $set: { isBlocked: true } }
    );

    res.redirect('/admin/users');

  } catch (error) {
    console.log(error);
  }
};

exports.unblockUser = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.params.id },
      { $set: { isBlocked: false } }
    );

    res.redirect('/admin/users');

  } catch (error) {
    console.log(error);
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.send('User not found');
    }

    res.render('admin/user-details', {
    user,
    orders: []   // always send
    });
  } catch (error) {
    console.log(error);
    res.send('User detail error');
  }
};