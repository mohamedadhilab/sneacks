const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profile_photo: {
    type: String,
    default: ''
  },
  phone_number: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);