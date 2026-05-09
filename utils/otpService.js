const OTP = require('../models/otpModel');

exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.saveOTP = async (email, otp, purpose) => {
  await OTP.deleteMany({ email, purpose });

  await OTP.create({
    email,
    otp,
    purpose,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000) 
  });
  console.log("otp is"+otp)
};

exports.verifyOTP = async (email, otp, purpose) => {
  const record = await OTP.findOne({ email, otp, purpose });

  if (!record) return false;

  if (record.expiresAt < new Date()) return false;

  await OTP.deleteMany({ email, purpose });

  return true;
};