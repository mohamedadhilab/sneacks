const Cart = require('../models/cartModel');

const cartCountMiddleware = async (req, res, next) => {

    try {

        let cartCount = 0;

        if(req.session.user){

            const cart = await Cart.findOne({

                userId: req.session.user.id
            });

            if(cart){

                cartCount = cart.items.reduce(

                    (total, item) => total + item.quantity,

                    0

                );

            }

        }

        res.locals.cartCount = cartCount;

        next();

    } catch (error) {

        console.log(error);

        res.locals.cartCount = 0;

        next();

    }

};

module.exports = cartCountMiddleware;