const Product = require('../../models/productModel');

const loadProductDetails = async (req, res) => {

    try {

        const productId = req.params.id;

        // =================================================
        // FETCH PRODUCT
        // =================================================

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

        // =================================================
        // PRODUCT NOT FOUND
        // =================================================

        if (!product || !product.category) {

            return res.redirect('/shop');

        }

        // =================================================
// TOTAL STOCK
// =================================================

const totalStock = product.variants.reduce(

    (total, variant) => total + variant.stock,

    0

);

        // =================================================
        // RELATED PRODUCTS
        // =================================================

        const relatedProducts = await Product.find({

            _id: { $ne: productId },

            category: product.category._id,

            is_blocked: false,

            is_deleted: false

        })

        .limit(4);

        // =================================================
        // RENDER PAGE
        // =================================================

        res.render('user/product-details', {

            product,

            relatedProducts,
            totalStock

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