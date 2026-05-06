const User = require('../../models/userModel');
const bcrypt = require('bcrypt');
const sendOtpMail = require('../../utils/mail');
const fs = require('fs');
const path = require('path');

const {
  generateOTP,
  saveOTP,
  verifyOTP
} = require('../../utils/otpService');


// ================= SIGNUP =================
exports.signup = async (req, res) => {

  try {

    const { name, email, password } = req.body;

    // CHECK EXISTING USER
    const existingUser = await User.findOne({ email });

    if (existingUser) {

      req.session.message = {
        type: 'error',
        text: 'User already exists'
      };

      return res.redirect('/signup');
    }

    // GENERATE OTP
    const otp = generateOTP();

    await saveOTP(email, otp, 'signup');

    // SEND MAIL
    await sendOtpMail(email, otp);

    // SESSION STORE
    req.session.otpTime = Date.now();

    req.session.tempUser = {
      name,
      email,
      password
    };

    // SUCCESS MESSAGE
    req.session.message = {
      type: 'success',
      text: 'OTP sent successfully'
    };

    // REDIRECT OTP PAGE
    res.redirect(`/otp?email=${email}&purpose=signup`);

  } catch (error) {

    console.log(error);

    req.session.message = {
      type: 'error',
      text: 'Signup failed'
    };

    return res.redirect('/signup');
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      req.session.message = { type: 'error', text: 'User not found' };
      return res.redirect('/login');
    }

    if (user.isBlocked) {
      req.session.message = { type: 'error', text: 'User is blocked' };
      return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      req.session.message = { type: 'error', text: 'Invalid password' };
      return res.redirect('/login');
    }

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email
    };
    req.session.message = {
    type: 'success',
    text: 'Login successful'
    };
    res.redirect('/home');

  } catch (error) {
    console.log(error);
req.session.message = {
  type: 'error',
  text: 'Something went wrong'
};

return res.redirect('/login');  }
};



// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      req.session.message = { type: 'error', text: 'User not found' };
      return res.redirect('/forgot-password');
    }

    const otp = generateOTP();
    await saveOTP(email, otp, 'forgot');

    await sendOtpMail(email, otp);

    req.session.otpTime = Date.now();

    res.redirect(`/otp?email=${email}&purpose=forgot`);

  } catch (error) {
    console.log(error);
    res.send('Forgot password error');
  }
};


// ================= OTP PAGE =================
exports.getOtpPage = (req, res) => {

  try {

    const { email, purpose } = req.query;

    res.render('user/otp', {
      email,
      purpose,
      otpTime: req.session.otpTime || Date.now()
    });

  } catch (error) {

    console.log(error);

    req.session.message = {
      type: 'error',
      text: 'Failed to load OTP page'
    };

    return res.redirect('/login');
  }
};

// ================= VERIFY OTP =================
exports.verifyOtp = async (req, res) => {

  try {

    const { email, otp, purpose } = req.body;

    // INVALID PURPOSE
    if (!purpose) {

      req.session.message = {
        type: 'error',
        text: 'Invalid request'
      };

      return res.redirect('/login');
    }

    // VERIFY OTP
    const isValid = await verifyOTP(email, otp, purpose);

    if (!isValid) {

      req.session.message = {
        type: 'error',
        text: 'Invalid OTP'
      };

      return res.redirect(`/otp?email=${email}&purpose=${purpose}`);
    }

    // OTP VERIFIED
    req.session.otpVerified = true;

    // =========================
    // SIGNUP
    // =========================
    if (purpose === 'signup') {

      const tempUser = req.session.tempUser;

      if (!tempUser) {

        req.session.message = {
          type: 'error',
          text: 'Session expired'
        };

        return res.redirect('/signup');
      }

      const hashedPassword = await bcrypt.hash(tempUser.password, 10);

      await User.create({
        name: tempUser.name,
        email: tempUser.email,
        password: hashedPassword
      });

      delete req.session.tempUser;

      req.session.message = {
        type: 'success',
        text: 'Account created successfully'
      };

      return res.redirect('/login');
    }

    // =========================
    // FORGOT PASSWORD
    // =========================
    if (purpose === 'forgot') {

      req.session.message = {
        type: 'success',
        text: 'OTP verified successfully'
      };

      return res.redirect(`/reset-password?email=${email}`);
    }

    // =========================
    // EMAIL CHANGE
    // =========================
    if (purpose === 'email-change') {

      const newEmail = req.session.newEmail;

      if (!newEmail) {

        req.session.message = {
          type: 'error',
          text: 'Session expired'
        };

        return res.redirect('/profile');
      }

      // CHECK EXISTING EMAIL
      const existingUser = await User.findOne({ email: newEmail });

      if (existingUser) {

        req.session.message = {
          type: 'error',
          text: 'Email already exists'
        };

        return res.redirect(`/otp?email=${email}&purpose=${purpose}`);
      }

      // UPDATE EMAIL
      await User.updateOne(
        { _id: req.session.user.id },
        { $set: { email: newEmail } }
      );

      req.session.user.email = newEmail;

      delete req.session.newEmail;

      req.session.message = {
        type: 'success',
        text: 'Email updated successfully'
      };

      return res.redirect('/profile');
    }

  } catch (error) {

    console.log(error);

    req.session.message = {
      type: 'error',
      text: 'OTP verification failed'
    };

    return res.redirect('/login');
  }
};

// ================= RESEND OTP =================
exports.resendOtp = async (req, res) => {
  try {
    let { email, purpose } = req.query;

    if (purpose === 'email-change') {
      email = req.session.newEmail;
    }

    const otp = generateOTP();

    await saveOTP(email, otp, purpose);
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

  try {

    const { email } = req.query;

    // CHECK OTP VERIFIED
    if (!req.session.otpVerified) {

      req.session.message = {
        type: 'error',
        text: 'Unauthorized access'
      };

      return res.redirect('/forgot-password');
    }

    res.render('user/reset-password', { email });

  } catch (error) {

    console.log(error);

    req.session.message = {
      type: 'error',
      text: 'Failed to load reset password page'
    };

    return res.redirect('/forgot-password');
  }
};


// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {

  try {

    // OTP CHECK
    if (!req.session.otpVerified) {

      req.session.message = {
        type: 'error',
        text: 'Unauthorized access'
      };

      return res.redirect('/forgot-password');
    }

    const { email, password } = req.body;

    // FIND USER
    const user = await User.findOne({ email });

    if (!user) {

      req.session.message = {
        type: 'error',
        text: 'User not found'
      };

      return res.redirect('/forgot-password');
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // UPDATE PASSWORD
    user.password = hashedPassword;

    await user.save();

    // CLEAR SESSION
    delete req.session.otpVerified;

    // SUCCESS MESSAGE
    req.session.message = {
      type: 'success',
      text: 'Password reset successful'
    };

    return res.redirect('/login');

  } catch (error) {

    console.log(error);

    req.session.message = {
      type: 'error',
      text: 'Password reset failed'
    };

    return res.redirect('/forgot-password');
  }
};

exports.logout = (req, res) => {

  delete req.session.user;

  req.session.message = {
    type: 'success',
    text: 'Logged out successfully'
  };

  return res.redirect('/login');
};

// ================= GOOGLE CALLBACK =================
exports.googleCallback = async (req, res) => {

  try {

    // LOGIN FAILED
    if (!req.user) {

      req.session.message = {
        type: 'error',
        text: 'Google login failed'
      };

      return res.redirect('/login');
    }

    // BLOCKED USER
    if (req.user.isBlocked) {

      req.session.message = {
        type: 'error',
        text: 'User is blocked'
      };

      return res.redirect('/login');
    }

    // SESSION STORE
    req.session.user = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    };

    req.session.message = {
      type: 'success',
      text: 'Google login successful'
    };

    return res.redirect('/home');

  } catch (error) {

    console.log(error);

    req.session.message = {
      type: 'error',
      text: 'Google authentication failed'
    };

    return res.redirect('/login');
  }
};