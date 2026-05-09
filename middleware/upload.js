const multer = require('multer');

const path = require('path');

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    let uploadPath = 'public/uploads';

    if (file.fieldname === 'image') {

      uploadPath = 'public/uploads/categories';

    }

    if (file.fieldname === 'profileImage') {

      uploadPath = 'public/uploads/profiles';

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

  const allowedTypes = /jpeg|jpg|png|webp/;

  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {

    cb(null, true);

  } else {

    cb(new Error('Only image files are allowed'));

  }

};

const upload = multer({

  storage,
  fileFilter

});

module.exports = upload;