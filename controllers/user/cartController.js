const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");
const Wishlist = require('../../models/wishlistModel');



const addToCart = async (req, res) => {

    try {

        

        const userId =
            req.session.user?.id;

        if (!userId) {

            return res.status(401).json({

                success: false,

                message: 'Please login first'

            });

        }

       

        const {
            productId,
            quantity,
            selectedSize
        } = req.body;

      

        const product = await Product.findOne({

            _id: productId,

            is_blocked: false,

            is_deleted: false

        }).populate({

            path: 'category',

            match: {

                is_active: true,

                is_deleted: false

            }

        });


        if (!product || !product.category) {

            return res.status(404).json({

                success: false,

                message: 'Product unavailable'

            });

        }


        const variant =
            product.variants.find(

                item =>
                    item.size == selectedSize

            );


        if (!variant) {

            return res.status(400).json({

                success: false,

                message: 'Size not found'

            });

        }


        if (
            variant.stock <
            Number(quantity)
        ) {

            return res.status(400).json({

                success: false,

                message: 'Not enough stock'

            });

        }

    

        let cart = await Cart.findOne({

            userId

        });

        

        if (!cart) {

            cart = new Cart({

                userId,

                items: []

            });

        }

     

        const existingItem =
            cart.items.find(

                item =>

                    item.productId.toString() ===
                    productId &&

                    item.size == selectedSize

            );

     

        if (existingItem) {

            const newQuantity =

                existingItem.quantity +
                Number(quantity);

        

            if (newQuantity > 5) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Maximum 5 items allowed'

                });

            }

       

            if (
                newQuantity >
                variant.stock
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Stock limit reached'

                });

            }

            existingItem.quantity +=
                Number(quantity);

        }

     

        else {

            cart.items.push({

                productId,

                quantity:
                    Number(quantity),

                size:
                    selectedSize

            });

        }

  

        await cart.save();
      

       await Wishlist.updateOne(

    { userId },

    {
        $pull: {

            items: {

                productId

            }

        }

    }

);


        return res.status(200).json({

            success: true,

            message:
                'Product added to cart'

        });

    }

    catch (error) {

        console.log(
            'ADD TO CART ERROR:',
            error
        );

        return res.status(500).json({

            success: false,

            message:
                'Something went wrong'

        });

    }

};


const loadCart = async (req, res) => {

    try {

  

        const userId =
            req.session.user.id;

    

        const cart = await Cart.findOne({

            userId

        }).populate({

            path: 'items.productId',

            populate: {

                path: 'category'

            }

        });



        if (
            cart &&
            cart.items.length > 0
        ) {

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

        }

  

        let cartTotal = 0;

        if (
            cart &&
            cart.items.length > 0
        ) {

            cart.items.forEach(item => {

                cartTotal +=

                    item.productId.price *
                    item.quantity;

            });

        }



        res.render('user/cart', {

            cart,

            cartTotal

        });

    }

    catch (error) {

        console.log(
            'LOAD CART ERROR:',
            error
        );

        res.redirect('/shop');

    }

};



const updateCartQuantity = async (req, res) => {

    try {


        const userId =
            req.session.user.id;

        const {
            itemId,
            action
        } = req.body;


        const cart = await Cart.findOne({

            userId

        });

        if (!cart) {

            return res.json({

                success: false,

                message: 'Cart not found'

            });

        }


        const item =
            cart.items.id(itemId);

        if (!item) {

            return res.json({

                success: false,

                message: 'Item not found'

            });

        }

     

        const product = await Product.findOne({

            _id: item.productId,

            is_blocked: false,

            is_deleted: false

        }).populate({

            path: 'category',

            match: {

                is_active: true,

                is_deleted: false

            }

        });


        if (!product || !product.category) {

            return res.status(404).json({

                success: false,

                message:
                    'Product unavailable'

            });

        }

   

        const variant =
            product.variants.find(

                v => v.size == item.size

            );

      

        if (!variant) {

            return res.json({

                success: false,

                message:
                    'Variant unavailable'

            });

        }


        if (action === 'increase') {

            if (
                item.quantity >=
                variant.stock
            ) {

                return res.json({

                    success: false,

                    message:
                        'Stock limit reached'

                });

            }

            if (item.quantity >= 5) {

                return res.json({

                    success: false,

                    message:
                        'Maximum 5 items allowed'

                });

            }

            item.quantity += 1;

        }

     

        if (action === 'decrease') {

            if (item.quantity > 1) {

                item.quantity -= 1;

            }

        }



        await cart.save();


        const itemTotal =

            product.price *
            item.quantity;

        let cartTotal = 0;

        const populatedCart =
            await Cart.findOne({

                userId

            }).populate(

                'items.productId'
            );

        populatedCart.items.forEach(
            cartItem => {

                if (cartItem.productId) {

                    cartTotal +=

                        cartItem.productId.price *

                        cartItem.quantity;

                }

            }
        );

      

        return res.json({

            success: true,

            quantity:
                item.quantity,

            itemTotal,

            cartTotal

        });

    }

    catch (error) {

        console.log(
            'UPDATE CART ERROR:',
            error
        );

        return res.json({

            success: false,

            message:
                'Something went wrong'

        });

    }

};



const removeCartItem = async (req, res) => {

    try {



        const userId =
            req.session.user.id;

       

        const { itemId } =
            req.body;

     

        const cart = await Cart.findOne({

            userId

        });

        if (!cart) {

            return res.json({

                success: false,

                message: 'Cart not found'

            });

        }

      

        cart.items =
            cart.items.filter(

                item =>

                    item._id.toString() !==
                    itemId

            );

    

        await cart.save();


        return res.status(200).json({

            success: true,

            message: 'Item removed'

        });

    }

    catch (error) {

        console.log(
            'REMOVE CART ERROR:',
            error
        );

        return res.json({

            success: false,

            message:
                'Something went wrong'

        });

    }

};

module.exports = {

    addToCart,

    loadCart,

    updateCartQuantity,

    removeCartItem

};