const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  expiresAt: Date,
  purpose: String // "signup" | "forgot" | "email-change"
}, { timestamps: true });

module.exports = mongoose.model('OTP', otpSchema);