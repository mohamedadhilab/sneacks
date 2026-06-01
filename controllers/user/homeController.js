const Product = require('../../models/productModel');



const loadHome = async (req, res) => {

    try {

  

        const products = await Product.find({

            is_blocked: false,

            is_deleted: false

        })

        .populate({

            path: 'category',

            match: {

                is_active: true,

                is_deleted: false

            }

        })

        .sort({ createdAt: -1 })

        .limit(8);

      

        const validProducts = products.filter(product =>

            product.category

        );

        

        res.render('user/home', {

            products: validProducts

        });

    }

    catch (error) {

        console.log(
            'HOME PAGE ERROR:',
            error
        );

        res.render('user/home', {

            products: []

        });

    }

};

module.exports = {

    loadHome

};