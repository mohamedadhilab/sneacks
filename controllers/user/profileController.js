const User = require('../../models/userModel');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const {
  generateOTP,
  saveOTP
} = require('../../utils/otpService');

const sendOtpMail = require('../../utils/mail');



exports.getProfile = async (req, res) => {

  try {

    const user = await User.findById(req.session.user.id);

    if (!user) {

      req.session.message = {
        type: 'error',
        text: 'Please login again'
      };

      return res.redirect('/login');
    }

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


exports.updateProfile = async (req, res) => {
  console.log("UPDATE PROFILE CONTROLLER HIT");
  try {

    const { name, email, phone, dob, removeImage } = req.body;

    const user = await User.findById(req.session.user.id);

    if (!user) {

      req.session.message = {
        type: 'error',
        text: 'User not found'
      };

      return res.redirect('/login');
    }

    
    if (email !== user.email) {

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

  
    user.name = name;

    user.phone = phone || null;

    user.dob = dob || null;


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


    if (req.file) {

      if (user.profileImage) {

        const oldImagePath = path.join(
          __dirname,
         '../../public/uploads/profiles',
          path.basename(user.profileImage)
        );

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

user.profileImage =
  '/uploads/profiles/' + req.file.filename;
    }

    await user.save();
    req.session.user.name = user.name;

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


exports.updatePassword = async (req, res) => {

  try {

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.session.user.id);

    if (!user) {

      req.session.message = {
        type: 'error',
        text: 'User not found'
      };

      return res.redirect('/login');
    }

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

    if (currentPassword === newPassword) {

      req.session.message = {
        type: 'error',
        text: 'New password cannot be same as old password'
      };

      return res.redirect('/profile');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

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
