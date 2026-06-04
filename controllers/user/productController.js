const Product = require('../../models/productModel');
const Wishlist = require('../../models/wishlistModel');

const loadProductDetails = async (req, res) => {

    try {

        const productId = req.params.id;



        const product = await Product.findOne({

            _id: productId,

            is_blocked: false,

            is_deleted: false

        })

        .populate({

            path: 'category',

            match: {

                is_active: true,

                is_deleted: false

            }

        });



        if (!product || !product.category) {

            return res.redirect('/shop');

        }

      

const totalStock = product.variants.reduce(

    (total, variant) => total + variant.stock,

    0

);


        const relatedProducts = await Product.find({

            _id: { $ne: productId },

            category: product.category._id,

            is_blocked: false,

            is_deleted: false

        })

        .limit(4);

        let inWishlist = false;


if (req.session.user) {


    const wishlist =
        await Wishlist.findOne({

            userId: req.session.user.id,

            "items.productId": product._id

        });


    if (wishlist) {

        inWishlist = true;

    }

}
      

        res.render('user/product-details', {

            product,

            relatedProducts,
            totalStock,
            inWishlist

        });

    } catch (error) {

        console.log(
            'PRODUCT DETAILS ERROR:',
            error
        );

        res.redirect('/shop');

    }

};
module.exports = {

    loadProductDetails

};