const multer = require('multer');

const path = require('path');

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(null, 'public/uploads/temp');

  },

  filename: (req, file, cb) => {

    cb(
      null,
      Date.now() +
      '-' +
      Math.round(Math.random() * 1E9) +
      path.extname(file.originalname)
    );

  }

});

const fileFilter = (req, file, cb) => {

  if (file.mimetype.startsWith('image/')) {

    cb(null, true);

  } else {

    cb(new Error('Only images allowed'), false);

  }

};

const upload = multer({

  storage,

  limits: {

    fileSize: 5 * 1024 * 1024

  },

  fileFilter

});

module.exports = upload;