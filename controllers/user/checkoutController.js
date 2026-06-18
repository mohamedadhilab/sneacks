const Cart = require('../../models/cartModel');

const Address = require('../../models/addressModel');
const Order = require('../../models/orderModel');
const Product = require('../../models/productModel');
const Coupon = require('../../models/couponModel');
const generateOrderId = () => {

    return 'ORD-' + Date.now();

};

const loadCheckout = async (req, res) => {

    try {

     

        const userId =
            req.session.user.id;

    

        const addresses =
            await Address.find({

                user_id: userId

            });



        const cart =
            await Cart.findOne({

                userId

            }).populate({

                path: 'items.productId',

                populate: {

                    path: 'category'

                }

            });

     

        if (

            !cart ||

            cart.items.length === 0

        ) {

            return res.redirect('/cart');

        }


        cart.items =
            cart.items.filter(item => {

                return (

                    item.productId &&

                    !item.productId.is_blocked &&

                    !item.productId.is_deleted &&

                    item.productId.category

                );

            });

        await cart.save();
        for(const item of cart.items){


        const product =
            item.productId;


        const variant =
            product.variants.find(v =>

                v.size == item.size

            );


        if(
            !variant ||
            variant.stock < item.quantity
        ){


            return res.redirect('/cart');


        }


    }

      

        let cartTotal = 0;

        cart.items.forEach(item => {

            cartTotal +=

                item.productId.price *

                item.quantity;

        });



        console.log(
            'ADDRESSES:',
            addresses
        );


        res.render(

            'user/checkout',

            {

                addresses,

                cart,

                cartTotal

            }

        );

    }

    catch (error) {

        console.log(

            'LOAD CHECKOUT ERROR:',
            error

        );

        res.redirect('/cart');

    }

};
const placeOrder = async (req, res) => {

    try {

        const userId =
            req.session.user.id;

        const {
            addressId,
            paymentMethod
        } = req.body;

        // =====================================
        // GET ADDRESS
        // =====================================

        const address =
            await Address.findById(addressId);

        if (!address) {

            return res.json({

                success: false,

                message: 'Address not found'

            });

        }

        // =====================================
        // GET CART
        // =====================================

        const cart =
            await Cart.findOne({

                userId

            }).populate('items.productId');

        if (
            !cart ||
            cart.items.length === 0
        ) {

            return res.json({

                success: false,

                message: 'Cart empty'

            });

        }

        // =====================================
        // ORDER ITEMS
        // =====================================

        let orderItems = [];

        let subtotal = 0;

        // =====================================
        // LOOP CART ITEMS
        // =====================================

        for (const item of cart.items) {

            const product =
                item.productId;

            // =================================
            // FIND VARIANT
            // =================================

            const variant =
                product.variants.find(

                    v => v.size == item.size

                );

            // =================================
            // STOCK CHECK
            // =================================

            if (
                !variant ||
                variant.stock < item.quantity
            ) {

                return res.json({

                    success: false,

                    message:
                        `${product.product_name} out of stock`

                });

            }

            // =================================
            // REDUCE STOCK
            // =================================

            variant.stock -= item.quantity;

            await product.save();

            // =================================
            // TOTAL
            // =================================

            const totalPrice =

                product.price *
                item.quantity;

            subtotal += totalPrice;

            // =================================
            // PUSH ORDER ITEM
            // =================================

            orderItems.push({

                productId: product._id,

                productName:
                    product.product_name,

                productImage:
                    product.productImage[0],

                size: item.size,

                quantity: item.quantity,

                price: product.price,

                totalPrice

            });

        }

        // =====================================
        // CREATE ORDER
        // =====================================
            let discount = 0;


            let couponData = {

                couponId:null,

                couponCode:null

            };



            if(req.session.coupon){


                discount =
                req.session.coupon.discount;


                couponData = {


                    couponId:
                    req.session.coupon.couponId,


                    couponCode:
                    req.session.coupon.couponCode


                };


            }



            const finalAmount =

            subtotal - discount;



            const order = new Order({


            userId,


            orderId:
            generateOrderId(),


            items:orderItems,


            address:{


            full_name:
            address.full_name,


            phone_number:
            address.phone_number,


            city:
            address.city,


            state:
            address.state,


            pincode:
            address.pincode,


            address:
            address.address


            },


            paymentMethod,


            subtotal,


            shippingCharge:0,


            discount,


            coupon:couponData,


            finalAmount


            });

        await order.save();
            if(req.session.coupon){


            await Coupon.findByIdAndUpdate(

            req.session.coupon.couponId,

            {

            $push:{

            usedUsers:userId

            }

            }

            );



            delete req.session.coupon;


            }
        // =====================================
        // CLEAR CART
        // =====================================

        cart.items = [];

        await cart.save();

        // =====================================
        // SUCCESS
        // =====================================

        return res.json({

            success: true,

            orderId: order._id

        });

    }

    catch (error) {

        console.log(
            'PLACE ORDER ERROR:',
            error
        );

        return res.json({

            success: false,

            message:
                'Something went wrong'

        });

    }

};
const loadSuccessPage = async (req, res) => {

    try {

        const order =
            await Order.findById(
                req.params.id
            );

        res.render(

            'user/order-success',

            { order }

        );

    }

    catch (error) {

        console.log(error);

        res.redirect('/shop');

    }

};

const applyCoupon = async(req,res)=>{


try{


const userId = req.session.user.id;


const {couponCode} = req.body;



const cart =
await Cart.findOne({

userId

}).populate('items.productId');



if(!cart){


return res.json({

success:false,

message:'Cart not found'

});


}



let cartTotal = 0;


cart.items.forEach(item=>{


cartTotal +=

item.productId.price *

item.quantity;


});




const coupon =
await Coupon.findOne({

couponCode:couponCode.toUpperCase(),

isActive:true,

isDeleted:false

});




if(!coupon){


return res.json({

success:false,

message:'Invalid coupon'

});


}





if(coupon.expiryDate < new Date()){


return res.json({

success:false,

message:'Coupon expired'

});


}





if(cartTotal < coupon.minimumAmount){


return res.json({

success:false,

message:`Minimum purchase ₹${coupon.minimumAmount}`

});


}





if(

coupon.usedUsers.includes(userId)

){


return res.json({

success:false,

message:'Coupon already used'

});


}
// CHECK COUPON LIMIT

if(

coupon.usedUsers.length >= coupon.usageLimit

){


return res.json({

success:false,

message:'Coupon usage limit reached'

});


}





let discount = 0;



if(coupon.discountType === 'percentage'){


discount =

(cartTotal * coupon.discountValue) / 100;



if(

coupon.maximumDiscount > 0 &&

discount > coupon.maximumDiscount

){


discount = coupon.maximumDiscount;


}


}else{


discount = coupon.discountValue;


}
if(discount > cartTotal){

    discount = cartTotal;

}



req.session.coupon = {

couponId:coupon._id,

couponCode:coupon.couponCode,

discount

};




return res.json({

success:true,

message:'Coupon applied',

discount,

finalAmount:cartTotal-discount

});




}catch(error){


console.log(error);


res.json({

success:false,

message:'Something went wrong'

});


}


};
const removeCoupon = async(req,res)=>{


delete req.session.coupon;



res.json({

success:true,

message:'Coupon removed'

});


};


module.exports = {

    loadCheckout,
    placeOrder,
    loadSuccessPage,
    applyCoupon,
    removeCoupon

};