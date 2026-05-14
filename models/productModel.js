// models/productModel.js

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

  product_name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    default: ''
  },

  brand: {
    type: String,
    default: ''
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  sale_price: {
    type: Number,
    default: 0
  },

  variants: [
    {
      size: {
        type: String,
        required: true
      },
      stock: {
        type: Number,
        required: true,
        default: 0
      }
    }
  ],

  sku: {
    type: String,
    unique: true
  },

  productImage: [{
    type: String
  }],

  status: {
    type: String,
    enum: ['Available', 'Out of Stock'],
    default: 'Available'
  },

  is_blocked: {
    type: Boolean,
    default: false
  },

  is_deleted: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

module.exports = mongoose.model(
  'Product',
  productSchema
);