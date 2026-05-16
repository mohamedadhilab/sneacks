
const Product =require('../../models/productModel');

const Category =require('../../models/categoryModel');
const sharp = require('sharp');

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

sortOption = { createdAt: -1 };
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

        // =========================
        // VALIDATIONS
        // =========================
        if (!product_name || !brand || !category || !price || !sizes || !stocks) {
            req.session.message = {
                type: 'error',
                text: 'Please fill all required fields'
            };
            return res.redirect('/admin/products');
        }

        // =========================
        // IMAGE VALIDATION
        // =========================
        if (!req.files || req.files.length < 3) {
            req.session.message = {
                type: 'error',
                text: 'Minimum 3 images required'
            };
            return res.redirect('/admin/products');
        }

        // =========================
        // VARIANTS LOGIC
        // =========================
        const variants = [];
        const sizeArray = Array.isArray(sizes) ? sizes : [sizes];
        const stockArray = Array.isArray(stocks) ? stocks : [stocks];

        for (let i = 0; i < sizeArray.length; i++) {
            if (sizeArray[i] && stockArray[i] >= 0) {
                variants.push({
                    size: sizeArray[i],
                    stock: Number(stockArray[i])
                });
            }
        }

        if (variants.length === 0) {
            req.session.message = {
                type: 'error',
                text: 'Minimum 1 variant required'
            };
            return res.redirect('/admin/products');
        }

const images = [];

for(const file of req.files){

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

    images.push(filename);

}
        const product = new Product({
            product_name,
            description,
            brand,
            category,
            price,
            variants,
            sku: sku || `SKU-${Date.now()}`,
            is_active: is_active === 'true',
            productImage: images
        });

        await product.save();

        req.session.message = {
            type: 'success',
            text: 'Product added successfully'
        };
        res.redirect('/admin/products');

    } catch (error) {
        console.log(error);
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

    // VARIANTS LOGIC
    const variants = [];
    if (sizes && stocks) {
      const sizeArray = Array.isArray(sizes) ? sizes : [sizes];
      const stockArray = Array.isArray(stocks) ? stocks : [stocks];

      for (let i = 0; i < sizeArray.length; i++) {
        if (sizeArray[i]) {
          variants.push({
            size: sizeArray[i],
            stock: Number(stockArray[i]) || 0
          });
        }
      }
    }

    const updateData = {
      product_name,
      description,
      brand,
      category,
      price,
      sku,
      variants
    };


// =========================
// EXISTING IMAGES
// =========================

let existingImages =
JSON.parse(req.body.existingImages || '[]');
const oldProduct =
await Product.findById(id);

// =========================
// NEW IMAGES
// =========================

const newImages = [];

if(req.files && req.files.length > 0){

    for(const file of req.files){

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

// =========================
// FINAL IMAGE ARRAY
// =========================

const finalImages = [...existingImages];
// =========================
// DELETE REMOVED IMAGES
// =========================

for(let i = 0; i < oldProduct.productImage.length; i++){

    const oldImage =
    oldProduct.productImage[i];

    if(
        oldImage &&
        !existingImages.includes(oldImage)
    ){

        const oldPath = path.join(
            'public/uploads/products',
            oldImage
        );

        if(fs.existsSync(oldPath)){

            fs.unlinkSync(oldPath);

        }

    }

}
let replaced = [];

if(replacedIndexes){

    replaced =
    JSON.parse(replacedIndexes);

}

let newIndex = 0;

// =========================
// REPLACE EDITED IMAGES
// =========================

for(const index of replaced){

    if(newImages[newIndex]){

        // OLD IMAGE NAME
        const oldImage =
        finalImages[index];

        // DELETE OLD FILE
        if(oldImage){

            const oldPath = path.join(
                'public/uploads/products',
                oldImage
            );

            if(fs.existsSync(oldPath)){

                fs.unlinkSync(oldPath);

            }

        }

        // REPLACE WITH NEW IMAGE
        finalImages[index] =
        newImages[newIndex];

        newIndex++;

    }

}

// =========================
// ADD NEW IMAGES TO EMPTY SLOTS
// =========================

for(let i = 0; i < 5; i++){

    if(
        !finalImages[i] &&
        newImages[newIndex]
    ){

        finalImages[i] =
        newImages[newIndex];

        newIndex++;

    }

}

// =========================
// VALIDATION
// =========================

const validImages =
finalImages.filter(img => img);

if(validImages.length < 3){

    req.session.message = {

        type: 'error',

        text: 'Minimum 3 images required'

    };

    return res.redirect('/admin/products');

}

// =========================
// SAVE
// =========================

updateData.productImage = validImages;
// SAVE FINAL IMAGES

updateData.productImage =
cleanedImages.filter(img => img);
    await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    req.session.message = {
      type: 'success',
      text: 'Product updated successfully'
    };

    res.redirect('/admin/products');

  } catch (error) {
    console.log(error);
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