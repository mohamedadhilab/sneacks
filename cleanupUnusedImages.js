const mongoose = require('mongoose');

const fs = require('fs');

const path = require('path');

const Product = require('./models/productModel');

// =========================
// MONGODB CONNECTION
// =========================

mongoose.connect('mongodb://127.0.0.1:27017/sneacks')

.then(async () => {

    console.log('MongoDB Connected');

    // =========================
    // GET ALL PRODUCTS
    // =========================

    const products = await Product.find({});

    // =========================
    // COLLECT USED IMAGES
    // =========================

    const usedImages = [];

    products.forEach(product => {

        if(product.productImage){

            product.productImage.forEach(img => {

                usedImages.push(img);

            });

        }

    });

    console.log(
        'Used Images:',
        usedImages.length
    );

    // =========================
    // READ UPLOAD FOLDER
    // =========================

    const uploadsPath =
    path.join(
        __dirname,
        'public/uploads/products'
    );

    const allFiles =
    fs.readdirSync(uploadsPath);

    console.log(
        'Total Files:',
        allFiles.length
    );

    // =========================
    // FIND UNUSED FILES
    // =========================

    const unusedFiles =
    allFiles.filter(file => {

        return !usedImages.includes(file);

    });

    console.log(
        'Unused Files:',
        unusedFiles.length
    );

    // =========================
    // DELETE UNUSED FILES
    // =========================

    unusedFiles.forEach(file => {

        const filePath =
        path.join(uploadsPath, file);

        fs.unlinkSync(filePath);

        console.log(
            'Deleted:',
            file
        );

    });

    console.log(
        'Cleanup Completed'
    );

    process.exit();

})

.catch(err => {

    console.log(err);

});