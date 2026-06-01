const mongoose = require('mongoose');

// ======================================================
// WISHLIST ITEM SCHEMA
// ======================================================

const wishlistItemSchema = new mongoose.Schema({

    productId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: 'Product',

        required: true

    }

});

// ======================================================
// WISHLIST SCHEMA
// ======================================================

const wishlistSchema = new mongoose.Schema({

    userId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: 'User',

        required: true,

        unique: true

    },

    items: [wishlistItemSchema]

}, {

    timestamps: true

});

// ======================================================
// EXPORT
// ======================================================

module.exports = mongoose.model(
    'Wishlist',
    wishlistSchema
);