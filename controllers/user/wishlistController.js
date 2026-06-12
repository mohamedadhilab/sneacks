const Wishlist = require('../../models/wishlistModel');

const Product = require('../../models/productModel');



const addToWishlist = async (req, res) => {

    try {

      

        const userId = req.session.user.id;


        const {
            productId
        } = req.body;

        

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

   

        if (!wishlist) {

            wishlist = new Wishlist({

                userId,

                items: []

            });

        }

     

        const alreadyExists =
            wishlist.items.find(item =>

                item.productId.toString() ===
                productId

            );

          if (alreadyExists) {


            wishlist.items =
            wishlist.items.filter(item =>

            item.productId.toString() !== productId

            );


            await wishlist.save();


            return res.json({

            success:true,

            removed:true,

            wishlistCount:wishlist.items.length,

            message:'Removed from wishlist'

            });


            }

     

        wishlist.items.push({

            productId

        });

      

        await wishlist.save();


       return res.json({

        success:true,

        wishlistCount:wishlist.items.length,

        message:'Added to wishlist'

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


const loadWishlist = async (req, res) => {

    try {

   
        const userId = req.session.user.id;

        

        const wishlist = await Wishlist.findOne({

            userId

        })

        .populate({

            path: 'items.productId',

            populate: {

                path: 'category'

            }

        });

     

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



const removeWishlistItem = async (req, res) => {

    try {

       

        const userId = req.session.user.id;


        const {
            productId
        } = req.body;

    

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



        wishlist.items =
            wishlist.items.filter(item =>

                item.productId.toString() !==
                productId

            );


        await wishlist.save();

 

        return res.json({

            success:true,

            removed:true,

            message:'Removed from wishlist',

            wishlistCount:wishlist.items.length

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



module.exports = {

    addToWishlist,

    loadWishlist,

    removeWishlistItem

};