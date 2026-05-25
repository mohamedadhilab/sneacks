const Product = require('../../models/productModel');
const Category = require('../../models/categoryModel');
const mongoose = require('mongoose');


const loadShopPage = async (req, res) => {

    try {


        const search = req.query.search || '';

        const sort = req.query.sort || '';

        const minPrice = req.query.minPrice || '';

        const maxPrice = req.query.maxPrice || '';

        const page = parseInt(req.query.page) || 1;


        const selectedCategories = req.query.category
            ? Array.isArray(req.query.category)
                ? req.query.category
                : [req.query.category]
            : [];


        const filter = {

            is_blocked: false,

            is_deleted: false

        };



        if (search.trim()) {

            filter.product_name = {

                $regex: search,

                $options: 'i'

            };

        }



        if (selectedCategories.length > 0) {

            filter.category = {

                $in: selectedCategories.map(id =>
                    new mongoose.Types.ObjectId(id)
                )

            };

        }


        if (minPrice || maxPrice) {

            filter.price = {};

            if (minPrice) {

                filter.price.$gte = Number(minPrice);

            }

            if (maxPrice) {

                filter.price.$lte = Number(maxPrice);

            }

        }


        let sortOption = {

            createdAt: -1

        };

        switch (sort) {

            case 'price-low':

                sortOption = {

                    price: 1

                };

                break;

            case 'price-high':

                sortOption = {

                    price: -1

                };

                break;

            case 'a-z':

                sortOption = {

                    product_name: 1

                };

                break;

            case 'z-a':

                sortOption = {

                    product_name: -1

                };

                break;

            case 'newest':

                sortOption = {

                    createdAt: -1

                };

                break;

            default:

                sortOption = {

                    createdAt: -1

                };

        }

        
        const limit = 3;

        const skip = (page - 1) * limit;



        const totalProducts =
            await Product.countDocuments(filter);

        const totalPages =
            Math.ceil(totalProducts / limit);



        const products = await Product.find(filter)

            .populate({

                path: 'category',

                match: {

                    is_active: true,

                    is_deleted: false

                }

            })

            .sort(sortOption)

            .skip(skip)

            .limit(limit);

        const filteredProducts = products.filter(
            product => product.category
        );



        const categories = await Category.find({

            is_active: true,

            is_deleted: false

        });



        const queryParams = new URLSearchParams();

        if (search) {

            queryParams.append('search', search);

        }

        if (sort) {

            queryParams.append('sort', sort);

        }

        if (minPrice) {

            queryParams.append('minPrice', minPrice);

        }

        if (maxPrice) {

            queryParams.append('maxPrice', maxPrice);

        }

        selectedCategories.forEach(cat => {

            queryParams.append('category', cat);

        });

        const queryString = queryParams.toString();



        res.render('user/shop', {

            products: filteredProducts,

            categories,

            totalProducts,

            totalPages,

            currentPage: page,

            search,

            sort,

            minPrice,

            maxPrice,

            selectedCategories,

            queryString

        });

    } catch (error) {

        console.log('SHOP PAGE ERROR:', error);

        res.send(error.message);

    }

};




module.exports = {

    loadShopPage

};