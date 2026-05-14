const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin/adminController');

const noCache = require('../middleware/noCache');

const validate = require('../middleware/validateMiddleware');

const adminValidation = require('../validations/adminValidation');
const categoryController = require('../controllers/admin/categoryController');
const categoryUpload = require('../middleware/upload');
const productController =
require('../controllers/admin/productController');

const productUpload =
require('../middleware/productUpload');
const {
  isAdminLoggedIn,
  isAdminLoggedOut
} = require('../middleware/adminAuth');


router.get(
  '/login',
  isAdminLoggedOut,
  noCache,
  adminController.getLogin
);

router.post(
  '/login',
  isAdminLoggedOut,
  validate(adminValidation.loginSchema),
  adminController.login
);


router.get(
  '/forgot-password',
  isAdminLoggedOut,
  adminController.getForgotPasswordPage
);

router.post(
  '/forgot-password',
  isAdminLoggedOut,
  adminController.forgotPassword
);

router.get(
  '/otp',
  isAdminLoggedOut,
  adminController.getOtpPage
);

router.post(
  '/verify-otp',
  isAdminLoggedOut,
  adminController.verifyOtp
);

router.get(
  '/reset-password',
  isAdminLoggedOut,
  adminController.getResetPage
);

router.post(
  '/reset-password',
  isAdminLoggedOut,
  adminController.resetPassword
);


router.get(
  '/dashboard',
  isAdminLoggedIn,
  noCache,
  adminController.getDashboard
);


router.get(
  '/users',
  isAdminLoggedIn,
  noCache,
  adminController.getUsers
);

router.get(
  '/user/:id',
  isAdminLoggedIn,
  adminController.getUserDetails
);

router.get(
  '/block-user/:id',
  isAdminLoggedIn,
  adminController.blockUser
);

router.get(
  '/unblock-user/:id',
  isAdminLoggedIn,
  adminController.unblockUser
);


router.get(
  '/logout',
  isAdminLoggedIn,
  adminController.logout
);

router.get(
  '/categories',
  isAdminLoggedIn,
  categoryController.getCategories
);

router.post(
  '/add-category',
  isAdminLoggedIn,
  categoryUpload.single('image'),
  categoryController.addCategory
);
router.post(
  '/edit-category/:id',
  isAdminLoggedIn,
  categoryUpload.single('image'),
  categoryController.editCategory
);

router.get(
  '/toggle-category/:id',
  isAdminLoggedIn,
  categoryController.toggleCategoryStatus
);
router.get(
  '/delete-category/:id',
  isAdminLoggedIn,
  categoryController.deleteCategory
);

router.get(
  '/products',
  isAdminLoggedIn,
  productController.getProducts
);

router.post(
  '/add-product',
  isAdminLoggedIn,
  productUpload.array('productImage', 5),
  productController.addProduct
);

router.post(
  '/edit-product/:id',
  isAdminLoggedIn,
  productUpload.array('productImage', 5),
  productController.editProduct
);

router.get(
  '/delete-product/:id',
  isAdminLoggedIn,
  productController.deleteProduct
);

router.get(
  '/product-details/:id',
  isAdminLoggedIn,
  productController.getProductDetails
);
router.get(
    '/toggle-product/:id',
    productController.toggleProduct
);

router.get(
    '/restore-product/:id',
    productController.restoreProduct
);

router.get(
    '/permanent-delete-product/:id',
    productController.permanentDeleteProduct
);

module.exports = router;