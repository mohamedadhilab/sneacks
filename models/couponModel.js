const mongoose = require('mongoose');


const couponSchema = new mongoose.Schema({

    couponCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },


    discountType: {
        type: String,
        enum: [
            'percentage',
            'fixed'
        ],
        default: 'percentage'
    },


    discountValue: {
        type: Number,
        required: true
    },


    minimumAmount: {
        type: Number,
        required: true
    },


    maximumDiscount: {
        type: Number,
        default: 0
    },


    expiryDate: {
        type: Date,
        required: true
    },


    usageLimit: {
        type: Number,
        default: 1
    },
    usedCount: {

    type:Number,

    default:0

    },


    usedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],


    isActive: {
        type: Boolean,
        default: true
    },


    isDeleted: {
        type: Boolean,
        default: false
    }


},
{
    timestamps:true
});


module.exports =
mongoose.model(
    'Coupon',
    couponSchema
);