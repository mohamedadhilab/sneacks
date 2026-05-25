const Cart = require('../../models/cartModel');

const Address = require('../../models/addressModel');
const Order = require('../../models/orderModel');
const Product = require('../../models/productModel');
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

        const order = new Order({

            userId,

            orderId:
                generateOrderId(),

            items: orderItems,

            address: {

                name: address.name,

                phone: address.phone,

                city: address.city,

                state: address.state,

                pincode: address.pincode,

                address_line:
                    address.address_line

            },

            paymentMethod,

            subtotal,

            shippingCharge: 0,

            discount: 0,

            finalAmount: subtotal

        });

        await order.save();

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


module.exports = {

    loadCheckout,
    placeOrder,
    loadSuccessPage

};