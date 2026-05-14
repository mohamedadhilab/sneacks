const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    unique: true,
    required: true
  },

  password: {
    type: String,
    default: null 
  },

  googleId: {
    type: String,
    default: null
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  isBlocked: {
    type: Boolean,
    default: false
  },
  profileImage: {
  type: String,
  default: null
},
phone: {
  type: String,
  default: ''
},
dob: {
  type: Date,
  default: null
}

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);