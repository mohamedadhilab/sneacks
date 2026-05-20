const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");

// ======================================================
// ADD TO CART
// ======================================================

const addToCart = async (req, res) => {

    try {

        // =========================================
        // USER CHECK
        // =========================================

        const userId =
            req.session.user?.id;

        if (!userId) {

            return res.status(401).json({

                success: false,

                message: 'Please login first'

            });

        }

        // =========================================
        // GET DATA
        // =========================================

        const {
            productId,
            quantity,
            selectedSize
        } = req.body;

        // =========================================
        // PRODUCT CHECK
        // =========================================

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

        // =========================================
        // PRODUCT NOT FOUND
        // =========================================

        if (!product || !product.category) {

            return res.status(404).json({

                success: false,

                message: 'Product unavailable'

            });

        }

        // =========================================
        // FIND VARIANT
        // =========================================

        const variant =
            product.variants.find(

                item =>
                    item.size == selectedSize

            );

        // =========================================
        // VARIANT NOT FOUND
        // =========================================

        if (!variant) {

            return res.status(400).json({

                success: false,

                message: 'Size not found'

            });

        }

        // =========================================
        // STOCK CHECK
        // =========================================

        if (
            variant.stock <
            Number(quantity)
        ) {

            return res.status(400).json({

                success: false,

                message: 'Not enough stock'

            });

        }

        // =========================================
        // FIND USER CART
        // =========================================

        let cart = await Cart.findOne({

            userId

        });

        // =========================================
        // CREATE CART
        // =========================================

        if (!cart) {

            cart = new Cart({

                userId,

                items: []

            });

        }

        // =========================================
        // CHECK EXISTING ITEM
        // =========================================

        const existingItem =
            cart.items.find(

                item =>

                    item.productId.toString() ===
                    productId &&

                    item.size == selectedSize

            );

        // =========================================
        // UPDATE EXISTING ITEM
        // =========================================

        if (existingItem) {

            const newQuantity =

                existingItem.quantity +
                Number(quantity);

            // =====================================
            // MAX LIMIT
            // =====================================

            if (newQuantity > 5) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Maximum 5 items allowed'

                });

            }

            // =====================================
            // STOCK LIMIT
            // =====================================

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

        // =========================================
        // ADD NEW ITEM
        // =========================================

        else {

            cart.items.push({

                productId,

                quantity:
                    Number(quantity),

                size:
                    selectedSize

            });

        }

        // =========================================
        // SAVE CART
        // =========================================

        await cart.save();

        // =========================================
        // SUCCESS
        // =========================================

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

// ======================================================
// LOAD CART PAGE
// ======================================================

const loadCart = async (req, res) => {

    try {

        // =========================================
        // USER ID
        // =========================================

        const userId =
            req.session.user.id;

        // =========================================
        // FIND CART
        // =========================================

        const cart = await Cart.findOne({

            userId

        }).populate({

            path: 'items.productId',

            populate: {

                path: 'category'

            }

        });

        // =========================================
        // REMOVE INVALID PRODUCTS
        // =========================================

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

        // =========================================
        // CART TOTAL
        // =========================================

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

        // =========================================
        // RENDER
        // =========================================

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

// ======================================================
// UPDATE CART QUANTITY
// ======================================================

const updateCartQuantity = async (req, res) => {

    try {

        // =========================================
        // GET DATA
        // =========================================

        const userId =
            req.session.user.id;

        const {
            itemId,
            action
        } = req.body;

        // =========================================
        // FIND CART
        // =========================================

        const cart = await Cart.findOne({

            userId

        });

        if (!cart) {

            return res.json({

                success: false,

                message: 'Cart not found'

            });

        }

        // =========================================
        // FIND ITEM
        // =========================================

        const item =
            cart.items.id(itemId);

        if (!item) {

            return res.json({

                success: false,

                message: 'Item not found'

            });

        }

        // =========================================
        // FIND PRODUCT
        // =========================================

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

        // =========================================
        // PRODUCT CHECK
        // =========================================

        if (!product || !product.category) {

            return res.status(404).json({

                success: false,

                message:
                    'Product unavailable'

            });

        }

        // =========================================
        // FIND VARIANT
        // =========================================

        const variant =
            product.variants.find(

                v => v.size == item.size

            );

        // =========================================
        // VARIANT CHECK
        // =========================================

        if (!variant) {

            return res.json({

                success: false,

                message:
                    'Variant unavailable'

            });

        }

        // =========================================
        // INCREASE
        // =========================================

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

        // =========================================
        // DECREASE
        // =========================================

        if (action === 'decrease') {

            if (item.quantity > 1) {

                item.quantity -= 1;

            }

        }

        // =========================================
        // SAVE
        // =========================================

        await cart.save();

        // =========================================
        // TOTALS
        // =========================================

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

        // =========================================
        // RESPONSE
        // =========================================

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

// ======================================================
// REMOVE CART ITEM
// ======================================================

const removeCartItem = async (req, res) => {

    try {

        // =========================================
        // USER
        // =========================================

        const userId =
            req.session.user.id;

        // =========================================
        // ITEM ID
        // =========================================

        const { itemId } =
            req.body;

        // =========================================
        // FIND CART
        // =========================================

        const cart = await Cart.findOne({

            userId

        });

        if (!cart) {

            return res.json({

                success: false,

                message: 'Cart not found'

            });

        }

        // =========================================
        // REMOVE ITEM
        // =========================================

        cart.items =
            cart.items.filter(

                item =>

                    item._id.toString() !==
                    itemId

            );

        // =========================================
        // SAVE
        // =========================================

        await cart.save();

        // =========================================
        // RESPONSE
        // =========================================

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