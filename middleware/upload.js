const multer = require('multer');

const path = require('path');

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    let uploadPath = 'public/temp';

    // CATEGORY IMAGE
    if (file.fieldname === 'image') {

      uploadPath = 'public/uploads/categories';

    }

    // PROFILE IMAGE
    if (file.fieldname === 'profileImage') {

      uploadPath = 'public/uploads/profiles';

    }

    // PRODUCT IMAGE
    if (file.fieldname === 'productImage') {

      uploadPath = 'public/temp';

    }

    cb(null, uploadPath);

  },

  filename: (req, file, cb) => {

    const uniqueName =
      Date.now() + path.extname(file.originalname);

    cb(null, uniqueName);

  }

});

const fileFilter = (req, file, cb) => {

  const allowedMimeTypes = [

    'image/jpeg',

    'image/jpg',

    'image/png',

    'image/webp',

    'image/heic',

    'image/heif'

  ];

  const extname = path
    .extname(file.originalname)
    .toLowerCase();

  const allowedExtensions = [

    '.jpg',

    '.jpeg',

    '.png',

    '.webp',

    '.heic',

    '.heif'

  ];

  // =====================================
  // VALIDATION
  // =====================================

  if (

    allowedMimeTypes.includes(file.mimetype) &&

    allowedExtensions.includes(extname)

  ) {

    cb(null, true);

  }

  else {

    cb(

      new Error(
        'Only image files are allowed'
      )

    );

  }

};

const upload = multer({

  storage,
  fileFilter

});

module.exports = upload;