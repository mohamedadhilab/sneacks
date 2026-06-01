const mongoose = require('mongoose');

// =====================================
// ORDER ITEM SCHEMA
// =====================================

const orderItemSchema = new mongoose.Schema({

    productId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: 'Product',

        required: true

    },

    productName: String,

    productImage: String,

    size: String,

    quantity: Number,

    price: Number,

    totalPrice: Number,

    status: {

        type: String,

        default: 'Pending'

    },

    cancelReason: String,

    returnReason: String

});

// =====================================
// ORDER SCHEMA
// =====================================

const orderSchema = new mongoose.Schema({

    userId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: 'User',

        required: true

    },

    orderId: {

        type: String,

        required: true,

        unique: true

    },

    items: [orderItemSchema],

    address: {

        name: String,

        phone: String,

        city: String,

        state: String,

        pincode: String,

        address_line: String

    },

    paymentMethod: {

        type: String,

        default: 'cod'

    },

    paymentStatus: {

        type: String,

        default: 'Pending'

    },

    orderStatus: {

        type: String,

        default: 'Pending'

    },

    subtotal: Number,

    shippingCharge: Number,

    discount: Number,

    finalAmount: Number

}, {

    timestamps: true

});

module.exports = mongoose.model(
    'Order',
    orderSchema
);