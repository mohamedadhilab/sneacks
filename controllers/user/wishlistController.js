const Wishlist = require('../../models/wishlistModel');

const Product = require('../../models/productModel');

// ======================================================
// ADD TO WISHLIST
// ======================================================

const addToWishlist = async (req, res) => {

    try {

        // =========================================
        // USER
        // =========================================

        const userId = req.session.user.id;

        // =========================================
        // PRODUCT
        // =========================================

        const {
            productId
        } = req.body;

        // =========================================
        // CHECK PRODUCT
        // =========================================

        const product = await Product.findOne({

            _id: productId,

            is_blocked: false,

            is_deleted: false

        });

        if (!product) {

            return res.json({

                success: false,

                message: 'Product unavailable'

            });

        }

        // =========================================
        // FIND WISHLIST
        // =========================================

        let wishlist = await Wishlist.findOne({

            userId

        });

        // =========================================
        // CREATE WISHLIST
        // =========================================

        if (!wishlist) {

            wishlist = new Wishlist({

                userId,

                items: []

            });

        }

        // =========================================
        // CHECK EXISTING
        // =========================================

        const alreadyExists =
            wishlist.items.find(item =>

                item.productId.toString() ===
                productId

            );

        if (alreadyExists) {

            return res.json({

                success: false,

                message:
                    'Already in wishlist'

            });

        }

        // =========================================
        // ADD ITEM
        // =========================================

        wishlist.items.push({

            productId

        });

        // =========================================
        // SAVE
        // =========================================

        await wishlist.save();

        // =========================================
        // RESPONSE
        // =========================================

        return res.json({

            success: true,

            message:
                'Added to wishlist'

        });

    }

    catch (error) {

        console.log(
            'ADD WISHLIST ERROR:',
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
// LOAD WISHLIST PAGE
// ======================================================

const loadWishlist = async (req, res) => {

    try {

        // =========================================
        // USER
        // =========================================

        const userId = req.session.user.id;

        // =========================================
        // FIND WISHLIST
        // =========================================

        const wishlist = await Wishlist.findOne({

            userId

        })

        .populate({

            path: 'items.productId',

            populate: {

                path: 'category'

            }

        });

        // =========================================
        // CLEAN INVALID PRODUCTS
        // =========================================

        if (wishlist && wishlist.items.length > 0) {

            wishlist.items =
                wishlist.items.filter(item => {

                    return (

                        item.productId &&

                        !item.productId.is_blocked &&

                        !item.productId.is_deleted &&

                        item.productId.category

                    );

                });

            await wishlist.save();

        }

        // =========================================
        // RENDER PAGE
        // =========================================

        res.render('user/wishlist', {

            wishlist

        });

    }

    catch (error) {

        console.log(
            'LOAD WISHLIST ERROR:',
            error
        );

        res.redirect('/shop');

    }

};

// ======================================================
// REMOVE FROM WISHLIST
// ======================================================

const removeWishlistItem = async (req, res) => {

    try {

        // =========================================
        // USER
        // =========================================

        const userId = req.session.user.id;

        // =========================================
        // PRODUCT
        // =========================================

        const {
            productId
        } = req.body;

        // =========================================
        // FIND WISHLIST
        // =========================================

        const wishlist = await Wishlist.findOne({

            userId

        });

        if (!wishlist) {

            return res.json({

                success: false,

                message:
                    'Wishlist not found'

            });

        }

        // =========================================
        // REMOVE ITEM
        // =========================================

        wishlist.items =
            wishlist.items.filter(item =>

                item.productId.toString() !==
                productId

            );

        // =========================================
        // SAVE
        // =========================================

        await wishlist.save();

        // =========================================
        // RESPONSE
        // =========================================

        return res.json({

            success: true,

            message:
                'Removed from wishlist'

        });

    }

    catch (error) {

        console.log(
            'REMOVE WISHLIST ERROR:',
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
// EXPORT
// ======================================================

module.exports = {

    addToWishlist,

    loadWishlist,

    removeWishlistItem

};