const Cart = require('../../models/cartModel');

const Address = require('../../models/addressModel');

// ======================================================
// LOAD CHECKOUT PAGE
// ======================================================

const loadCheckout = async (req, res) => {

    try {

        // =========================================
        // USER ID
        // =========================================

        const userId =
            req.session.user.id;

        // =========================================
        // GET ADDRESSES
        // =========================================

        const addresses =
            await Address.find({

                user_id: userId

            });

        // =========================================
        // GET CART
        // =========================================

        const cart =
            await Cart.findOne({

                userId

            }).populate({

                path: 'items.productId',

                populate: {

                    path: 'category'

                }

            });

        // =========================================
        // EMPTY CART
        // =========================================

        if (

            !cart ||

            cart.items.length === 0

        ) {

            return res.redirect('/cart');

        }

        // =========================================
        // REMOVE INVALID PRODUCTS
        // =========================================

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

        // =========================================
        // CART TOTAL
        // =========================================

        let cartTotal = 0;

        cart.items.forEach(item => {

            cartTotal +=

                item.productId.price *

                item.quantity;

        });

        // =========================================
        // DEBUG
        // =========================================

        console.log(
            'ADDRESSES:',
            addresses
        );

        // =========================================
        // RENDER
        // =========================================

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

// ======================================================
// EXPORT
// ======================================================

module.exports = {

    loadCheckout

};