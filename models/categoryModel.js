const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({

  category_name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },

  description: {
    type: String,
    default: ''
  },

  image: {
    type: String,
    default: ''
  },

  is_active: {
    type: Boolean,
    default: true
  },

  is_deleted: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: false
  }
});

module.exports = mongoose.model('Category', categorySchema);