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

type:String,

enum:[

'Pending',
'Processing',
'Shipped',
'Out For Delivery',
'Delivered',
'Cancelled',
'Return Requested',
'Returned',
'Return Rejected'

],

default:'Pending'

},

cancelReason: {

    type:String,

    default:null

},


returnReason: {

    type:String,

    default:null

},
returnStatus:{

type:String,

enum:[
'None',
'Requested',
'Approved',
'Rejected'
],

default:'None'

},


returnRequestedAt:{

type:Date,

default:null

},


returnedAt:{

type:Date,

default:null

},
returnRejectedAt:{

type:Date,

default:null

}
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

    full_name: {

        type: String,

        required: true

    },

    phone_number: {

        type: String,

        required: true

    },

    address: {

        type: String,

        required: true

    },

    city: {

        type: String,

        required: true

    },

    state: {

        type: String,

        required: true

    },

    pincode: {

        type: String,

        required: true

    }

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

    type:String,

   enum:[

'Pending',
'Processing',
'Shipped',
'Out For Delivery',
'Delivered',
'Cancelled',
'Return Requested',
'Returned',
'Return Rejected'

],

    default:'Pending'

},

    subtotal: Number,

    shippingCharge: Number,

    discount: Number,
    tax:{

    type:Number,

    default:0

},
    finalAmount: Number

}, {

    timestamps: true

});

module.exports = mongoose.model(
    'Order',
    orderSchema
);