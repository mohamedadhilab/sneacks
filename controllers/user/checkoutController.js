const Cart = require('../../models/cartModel');

const Address = require('../../models/addressModel');



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


module.exports = {

    loadCheckout

};