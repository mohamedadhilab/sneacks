
const Product =require('../../models/productModel');

const Category =require('../../models/categoryModel');
const sharp = require('sharp');
const {
    addProductSchema,

    editProductSchema
} = require('../../validations/adminValidation');

const fs = require('fs');

const path = require('path');


exports.getProducts = async (req, res) => {

  try {

    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const trash =
        req.query.trash === 'true';

    const sort = req.query.sort || 'latest';
    let sortOption = { createdAt: -1 };
    if(sort === 'price-high'){

    sortOption = { price: -1 };

}

else if(sort === 'price-low'){

    sortOption = { price: 1 };

}

else if(sort === 'stock-low'){

    sortOption = { 'variants.stock': 1 };

}

    const products = await Product.find({

      is_deleted: trash,

      product_name: {
        $regex: search,
        $options: 'i'
      }

    })
    

    .populate('category')

    .sort(sortOption)
    .skip(skip)
    .limit(limit);
    
    const totalProducts = await Product.countDocuments({

    is_deleted: trash,

    product_name: {
        $regex: search,
        $options: 'i'
    }

});
const totalPages = Math.ceil(totalProducts / limit);
    const categories = await Category.find({

      is_deleted: false

    });

    // DYNAMIC BRANDS

    const brands = [

      'Nike',
      'Adidas',
      'Puma',
      'Jordan',
      'New Balance'

    ];

    res.render('admin/products', {

      products,
      categories,
      brands,
      search,
      trash,
      page,
      sort,

        totalPages,
        totalProducts,
        limit,
        skip

    });

  } catch (error) {

    console.log('GET PRODUCTS ERROR:', error);

    req.session.message = {

        type: 'error',

        text: 'Something went wrong'

    };

    res.redirect('/admin/products');

}

};

exports.addProduct = async (req, res) => {

    try {

        const {

            product_name,
            description,
            brand,
            category,
            price,
            sku,
            is_active,
            sizes,
            stocks

        } = req.body;

        // =====================================================
        // JOI VALIDATION
        // =====================================================

        const { error } =
            addProductSchema.validate(req.body);

        if (error) {

            req.session.message = {

                type: 'error',

                text: error.details[0].message

            };

            return res.redirect('/admin/products');

        }

        // =====================================================
        // IMAGE VALIDATION
        // =====================================================

        if (!req.files || req.files.length < 3) {

            req.session.message = {

                type: 'error',

                text: 'Minimum 3 images required'

            };

            return res.redirect('/admin/products');

        }

        // =====================================================
        // DUPLICATE SIZE VALIDATION
        // =====================================================

        const sizeArray =
            Array.isArray(sizes)
                ? sizes
                : [sizes];

        const stockArray =
            Array.isArray(stocks)
                ? stocks
                : [stocks];

        const uniqueSizes =
            new Set(sizeArray);

        if (uniqueSizes.size !== sizeArray.length) {

            req.session.message = {

                type: 'error',

                text: 'Duplicate sizes are not allowed'

            };

            return res.redirect('/admin/products');

        }

        // =====================================================
        // SKU VALIDATION
        // =====================================================

        if (sku && sku.trim() !== '') {

            const existingSku =
                await Product.findOne({

                    sku: sku.trim()

                });

            if (existingSku) {

                req.session.message = {

                    type: 'error',

                    text: 'SKU already exists'

                };

                return res.redirect('/admin/products');

            }

        }

        // =====================================================
        // VARIANTS
        // =====================================================

        const variants = [];

        for (let i = 0; i < sizeArray.length; i++) {

            const stockValue =
                Number(stockArray[i]);

            if (!sizeArray[i]) {
                continue;
            }

            // NEGATIVE STOCK
            if (stockValue < 0) {

                req.session.message = {

                    type: 'error',

                    text: 'Stock cannot be negative'

                };

                return res.redirect('/admin/products');

            }

            variants.push({

                size: sizeArray[i],

                stock: stockValue

            });

        }

        // =====================================================
        // MINIMUM VARIANT
        // =====================================================

        if (variants.length === 0) {

            req.session.message = {

                type: 'error',

                text: 'Minimum 1 variant required'

            };

            return res.redirect('/admin/products');

        }

        // =====================================================
        // IMAGE PROCESSING
        // =====================================================

        const images = [];

        for (const file of req.files) {

            const filename =

                `product-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;

            await sharp(file.path)

                .resize(800, 800)

                .jpeg({

                    quality: 90

                })

                .toFile(

                    path.join(

                        'public/uploads/products',

                        filename

                    )

                );

            // DELETE TEMP FILE

            fs.unlinkSync(file.path);

            images.push(filename);

        }

        // =====================================================
        // CREATE PRODUCT
        // =====================================================

        const product = new Product({

            product_name: product_name.trim(),

            description: description.trim(),

            brand: brand.trim(),

            category,

            price: Number(price),

            variants,

            sku:

                sku && sku.trim() !== ''

                    ? sku.trim()

                    : `SKU-${Date.now()}`,

            is_active:

                is_active === 'true',

            productImage: images

        });

        // =====================================================
        // SAVE
        // =====================================================

        await product.save();

        // =====================================================
        // SUCCESS
        // =====================================================

        req.session.message = {

            type: 'success',

            text: 'Product added successfully'

        };

        res.redirect('/admin/products');

    }

    catch (error) {

        console.log(

            'ADD PRODUCT ERROR:',

            error

        );

        req.session.message = {

            type: 'error',

            text: 'Something went wrong'

        };

        res.redirect('/admin/products');

    }

};



exports.deleteProduct = async (req, res) => {

    try {

        await Product.findByIdAndUpdate(

            req.params.id,

            {

                is_deleted: true

            }

        );

        req.session.message = {

            type: 'success',

            text: 'Product moved to trash'

        };

        res.redirect('/admin/products');

    } catch (error) {

        console.log(error);

        res.redirect('/admin/products');

    }

};

exports.getProductDetails = async (req, res) => {

  try {

    const product =
      await Product.findById(req.params.id)

      .populate('category');

    res.render(
      'admin/product-details',
      { product }
    );

  } catch (error) {

    console.log(error);

  }

};

exports.editProduct = async (req, res) => {

    try {

        const id = req.params.id;

        const {

            product_name,
            description,
            brand,
            category,
            price,
            sku,
            sizes,
            stocks,
            replacedIndexes

        } = req.body;

        // =====================================================
        // JOI VALIDATION
        // =====================================================

        const { error } =
            editProductSchema.validate(req.body);

        if (error) {

            req.session.message = {

                type: 'error',

                text: error.details[0].message

            };

            return res.redirect('/admin/products');

        }

        // =====================================================
        // SIZE ARRAY
        // =====================================================

        const sizeArray =
            Array.isArray(sizes)
                ? sizes
                : [sizes];

        const stockArray =
            Array.isArray(stocks)
                ? stocks
                : [stocks];

        // =====================================================
        // DUPLICATE SIZE VALIDATION
        // =====================================================

        const uniqueSizes =
            new Set(sizeArray);

        if (uniqueSizes.size !== sizeArray.length) {

            req.session.message = {

                type: 'error',

                text: 'Duplicate sizes are not allowed'

            };

            return res.redirect('/admin/products');

        }

        // =====================================================
        // SKU VALIDATION
        // =====================================================

        if (sku && sku.trim() !== '') {

            const existingSku =
                await Product.findOne({

                    sku: sku.trim(),

                    _id: { $ne: id }

                });

            if (existingSku) {

                req.session.message = {

                    type: 'error',

                    text: 'SKU already exists'

                };

                return res.redirect('/admin/products');

            }

        }

        // =====================================================
        // VARIANTS
        // =====================================================

        const variants = [];

        for (let i = 0; i < sizeArray.length; i++) {

            const stockValue =
                Number(stockArray[i]);

            if (!sizeArray[i]) {
                continue;
            }

            if (stockValue < 0) {

                req.session.message = {

                    type: 'error',

                    text: 'Stock cannot be negative'

                };

                return res.redirect('/admin/products');

            }

            variants.push({

                size: sizeArray[i],

                stock: stockValue

            });

        }

        // =====================================================
        // EXISTING IMAGES
        // =====================================================

        let existingImages =
            JSON.parse(
                req.body.existingImages || '[]'
            );

        const oldProduct =
            await Product.findById(id);

        // =====================================================
        // NEW IMAGES
        // =====================================================

        const newImages = [];

        if (req.files && req.files.length > 0) {

            for (const file of req.files) {

                const filename =

                    `product-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;

                await sharp(file.path)

                    .resize(800, 800)

                    .jpeg({

                        quality: 90

                    })

                    .toFile(

                        path.join(

                            'public/uploads/products',

                            filename

                        )

                    );

                fs.unlinkSync(file.path);

                newImages.push(filename);

            }

        }

        // =====================================================
        // FINAL IMAGE ARRAY
        // =====================================================

        const finalImages =
            [...existingImages];

        // =====================================================
        // DELETE REMOVED IMAGES
        // =====================================================

        for (

            let i = 0;

            i < oldProduct.productImage.length;

            i++

        ) {

            const oldImage =
                oldProduct.productImage[i];

            if (

                oldImage &&

                !existingImages.includes(oldImage)

            ) {

                const oldPath =
                    path.join(

                        'public/uploads/products',

                        oldImage

                    );

                if (fs.existsSync(oldPath)) {

                    fs.unlinkSync(oldPath);

                }

            }

        }

        // =====================================================
        // REPLACED IMAGES
        // =====================================================

        let replaced = [];

        if (replacedIndexes) {

            replaced =
                JSON.parse(replacedIndexes);

        }

        let newIndex = 0;

        // =====================================================
        // REPLACE IMAGES
        // =====================================================

        for (const index of replaced) {

            if (newImages[newIndex]) {

                const oldImage =
                    finalImages[index];

                if (oldImage) {

                    const oldPath =
                        path.join(

                            'public/uploads/products',

                            oldImage

                        );

                    if (fs.existsSync(oldPath)) {

                        fs.unlinkSync(oldPath);

                    }

                }

                finalImages[index] =
                    newImages[newIndex];

                newIndex++;

            }

        }

        // =====================================================
        // ADD NEW IMAGES
        // =====================================================

        for (let i = 0; i < 5; i++) {

            if (

                !finalImages[i] &&

                newImages[newIndex]

            ) {

                finalImages[i] =
                    newImages[newIndex];

                newIndex++;

            }

        }

        // =====================================================
        // IMAGE VALIDATION
        // =====================================================

        const validImages =
            finalImages.filter(img => img);

        if (validImages.length < 3) {

            req.session.message = {

                type: 'error',

                text: 'Minimum 3 images required'

            };

            return res.redirect('/admin/products');

        }

        // =====================================================
        // UPDATE DATA
        // =====================================================

        const updateData = {

            product_name:
                product_name.trim(),

            description:
                description.trim(),

            brand:
                brand.trim(),

            category,

            price:
                Number(price),

            sku:

                sku && sku.trim() !== ''

                    ? sku.trim()

                    : `SKU-${Date.now()}`,

            variants,

            productImage:
                validImages

        };

        // =====================================================
        // UPDATE PRODUCT
        // =====================================================

        await Product.findByIdAndUpdate(

            id,

            updateData,

            { new: true }

        );

        // =====================================================
        // SUCCESS
        // =====================================================

        req.session.message = {

            type: 'success',

            text: 'Product updated successfully'

        };

        res.redirect('/admin/products');

    }

    catch (error) {

        console.log(

            'EDIT PRODUCT ERROR:',

            error

        );

        req.session.message = {

            type: 'error',

            text: 'Something went wrong'

        };

        res.redirect('/admin/products');

    }

};

exports.loadProducts = async (req, res) => {

    try {

        const products = await Product
            .find()
            .populate('category')
            .sort({ createdAt: -1 });

        const categories = await Category.find();

        res.render('admin/products', {
            products,
            categories
        });

    } catch (error) {

        console.log(error);

    }

};
exports.toggleProduct = async (req, res) => {

    try {

        const product =
        await Product.findById(req.params.id);

        product.is_blocked =
        !product.is_blocked;

        await product.save();

        req.session.message = {

            type: 'success',

            text: product.is_blocked
            ? 'Product unlisted successfully'
            : 'Product listed successfully'

        };

        res.redirect('/admin/products');

    } catch (error) {

        console.log(error);

        res.redirect('/admin/products');

    }

};

exports.restoreProduct = async (req, res) => {

    try {

        await Product.findByIdAndUpdate(

            req.params.id,

            {

                is_deleted: false

            }

        );

        req.session.message = {

            type: 'success',

            text: 'Product restored successfully'

        };

        res.redirect('/admin/products?trash=true');
    } catch (error) {

        console.log(error);
 
    }

};
exports.permanentDeleteProduct = async (req, res) => {

    try {
const product =
await Product.findById(req.params.id);

if(product){

    for(const image of product.productImage){

        const imagePath = path.join(
            'public/uploads/products',
            image
        );

        if(fs.existsSync(imagePath)){

            fs.unlinkSync(imagePath);

        }

    }

}

await Product.findByIdAndDelete(
    req.params.id
);

        req.session.message = {

            type: 'success',

            text: 'Product deleted permanently'

        };

        res.redirect('/admin/products?trash=true');
    } catch (error) {

        console.log(error);

    }

};