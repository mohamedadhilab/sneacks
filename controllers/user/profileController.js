const User = require('../../models/userModel');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const {
  generateOTP,
  saveOTP
} = require('../../utils/otpService');

const sendOtpMail = require('../../utils/mail');



// ================= GET PROFILE =================
exports.getProfile = async (req, res) => {

  try {

    const user = await User.findById(req.session.user.id);

    // USER NOT FOUND
    if (!user) {

      req.session.message = {
        type: 'error',
        text: 'Please login again'
      };

      return res.redirect('/login');
    }

    // RENDER PROFILE
    res.render('user/profile', { user });

  } catch (error) {

    console.log(error);

    req.session.message = {
      type: 'error',
      text: 'Failed to load profile'
    };

    return res.redirect('/home');
  }
};


// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  console.log("UPDATE PROFILE CONTROLLER HIT");
  try {

    const { name, email, phone, dob, removeImage } = req.body;

    // FIND USER
    const user = await User.findById(req.session.user.id);

    if (!user) {

      req.session.message = {
        type: 'error',
        text: 'User not found'
      };

      return res.redirect('/login');
    }

    // ============================
    // EMAIL CHANGE FLOW
    // ============================
    if (email !== user.email) {

      // CHECK EMAIL EXISTS
      const existingUser = await User.findOne({ email });

      if (existingUser) {

        req.session.message = {
          type: 'error',
          text: 'Email already exists'
        };

        return res.redirect('/profile');
      }

      const otp = generateOTP();

      await saveOTP(email, otp, 'email-change');

      await sendOtpMail(email, otp);

      req.session.otpTime = Date.now();

      req.session.newEmail = email;

      req.session.message = {
        type: 'success',
        text: 'OTP sent to new email'
      };

      return res.redirect(`/otp?email=${email}&purpose=email-change`);
    }

    // ============================
    // UPDATE BASIC DETAILS
    // ============================
    user.name = name;

    user.phone = phone || null;

    user.dob = dob || null;

    // ============================
    // REMOVE IMAGE
    // ============================
    if (removeImage === 'true') {

      if (user.profileImage) {

        const oldImagePath = path.join(
          __dirname,
          '../../public/uploads',
          path.basename(user.profileImage)
        );

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      user.profileImage = null;
    }

    // ============================
    // NEW IMAGE UPLOAD
    // ============================
    if (req.file) {

      // DELETE OLD IMAGE
      if (user.profileImage) {

        const oldImagePath = path.join(
          __dirname,
          '../../public/uploads',
          path.basename(user.profileImage)
        );

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // SAVE NEW IMAGE
      user.profileImage = '/uploads/' + req.file.filename;
    }

    // SAVE USER
    await user.save();

    req.session.message = {
      type: 'success',
      text: 'Profile updated successfully'
    };

    return res.redirect('/profile');

  } catch (error) {

    console.log(error);

    req.session.message = {
      type: 'error',
      text: 'Profile update failed'
    };

    return res.redirect('/profile');
  }
};


// ================= UPDATE PASSWORD =================
exports.updatePassword = async (req, res) => {

  try {

    const { currentPassword, newPassword } = req.body;

    // FIND USER
    const user = await User.findById(req.session.user.id);

    if (!user) {

      req.session.message = {
        type: 'error',
        text: 'User not found'
      };

      return res.redirect('/login');
    }

    // CHECK CURRENT PASSWORD
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {

      req.session.message = {
        type: 'error',
        text: 'Current password is incorrect'
      };

      return res.redirect('/profile');
    }

    // CHECK SAME PASSWORD
    if (currentPassword === newPassword) {

      req.session.message = {
        type: 'error',
        text: 'New password cannot be same as old password'
      };

      return res.redirect('/profile');
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // UPDATE PASSWORD
    user.password = hashedPassword;

    await user.save();

    req.session.message = {
      type: 'success',
      text: 'Password updated successfully'
    };

    return res.redirect('/profile');

  } catch (error) {

    console.log(error);

    req.session.message = {
      type: 'error',
      text: 'Password update failed'
    };

    return res.redirect('/profile');
  }
};
