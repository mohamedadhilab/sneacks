const express = require('express');
const router = express.Router();
const passport = require('passport');

const upload = require('../middleware/upload');

const authController = require('../controllers/user/authController');
const profileController = require('../controllers/user/profileController');
const addressController = require('../controllers/user/addressController');
const shopController=require('../controllers/user/shopController')
const productController =require('../controllers/user/productController');
const cartController =require('../controllers/user/cartController');
const wishlistController =require('../controllers/user/wishlistController');
const checkoutController =require('../controllers/user/checkoutController');
const homeController =require('../controllers/user/homeController');
const orderController = require('../controllers/user/orderController');
const {
  isLoggedIn,
  isLoggedOut
} = require('../middleware/authMiddleware');

const noCache = require('../middleware/noCache');

const validate = require('../middleware/validateMiddleware');

const userValidation = require('../validations/userValidation');




router.get('/', (req, res) => {

    res.redirect('/home');

});



router.get(

    '/home',

    noCache,

    homeController.loadHome

);
router.get(
  '/login',
  isLoggedOut,
  noCache,
  authController.getLoginPage
);

router.get(
  '/signup',
  isLoggedOut,
  noCache,
  authController.getSignupPage
);;

router.get(
  '/forgot-password',
  isLoggedOut,
  noCache,
  authController.getForgotPasswordPage
);


router.post(
  '/signup',
  isLoggedOut,
  validate(userValidation.signupSchema),
  authController.signup
);

router.post(
  '/login',
  isLoggedOut,
  validate(userValidation.loginSchema),
  authController.login
);

router.get(
  '/logout',
  isLoggedIn,
  authController.logout
);


router.post(
  '/forgot-password',
  isLoggedOut,
  validate(userValidation.forgotPasswordSchema),
  authController.forgotPassword
);

router.get(
  '/reset-password',
  isLoggedOut,
  noCache,
  authController.getResetPage
);

router.post(
  '/reset-password',
  isLoggedOut,
  validate(userValidation.resetPasswordSchema),
  authController.resetPassword
);


router.get(
  '/otp',
  noCache,
  authController.getOtpPage
);

router.post(
  '/verify-otp',
  validate(userValidation.otpSchema),
  authController.verifyOtp
);

router.get(
  '/resend-otp',
  authController.resendOtp
);


router.get(
  '/home',
  noCache,
  (req, res) => {
    res.render('user/home');
  }
);


router.get(
  '/profile',
  isLoggedIn,
  noCache,
  profileController.getProfile
);

router.post(
  '/update-profile',
  isLoggedIn,
  upload.single('profileImage'),
  validate(userValidation.profileSchema),
  profileController.updateProfile
);

router.post(
  '/update-password',
  isLoggedIn,
  validate(userValidation.changePasswordSchema),
  profileController.updatePassword
);


router.get(
  '/auth/google',
  isLoggedOut,
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get(
  '/auth/google/callback',

  isLoggedOut,

  passport.authenticate('google', {
    failureRedirect: '/login'
  }),

  authController.googleCallback
);


router.get(
  '/address',
  isLoggedIn,
  noCache,
  addressController.getAddressPage
);

router.post(
  '/add-address',
  isLoggedIn,
  validate(userValidation.addressSchema),
  addressController.addAddress
);

router.put(
  '/update-address/:id',
  isLoggedIn,
  validate(userValidation.addressSchema),
  addressController.updateAddress
);

router.delete(
  '/delete-address/:id',
  isLoggedIn,
  addressController.deleteAddress
);


router.get('/shop', shopController.loadShopPage);
router.get(
    '/product/:id',
    productController.loadProductDetails
);
router.post(

    '/add-to-cart',

    isLoggedIn,

    cartController.addToCart

);
router.get(
    '/cart',
    isLoggedIn,
    cartController.loadCart
);
router.patch(
    '/update-cart-quantity',
    isLoggedIn,
    cartController.updateCartQuantity
);

router.delete(
    '/remove-cart-item',
    isLoggedIn,
    cartController.removeCartItem
);


router.post(

    '/add-to-wishlist',

    isLoggedIn,

    wishlistController.addToWishlist

);

router.get(

    '/wishlist',

    isLoggedIn,

    wishlistController.loadWishlist

);

router.delete(

    '/remove-wishlist-item',

    isLoggedIn,

    wishlistController.removeWishlistItem

);
router.get(

    '/checkout',

    isLoggedIn,

    checkoutController.loadCheckout

);

router.post(

    '/place-order',

    isLoggedIn,

    checkoutController.placeOrder

);
router.get(

    '/order-success/:id',

    isLoggedIn,

    checkoutController.loadSuccessPage

);

router.get(

    '/orders',

    isLoggedIn,

    orderController.loadOrders

);
router.get(

    '/order-details/:id',

    isLoggedIn,

    orderController.loadOrderDetails

);
router.patch(

    '/cancel-item/:orderId/:itemId',

    isLoggedIn,

    orderController.cancelItem

);
router.patch(

    '/return-item/:orderId/:itemId',

    isLoggedIn,

    orderController.returnItem

);
router.get(

    '/download-invoice/:id',

    isLoggedIn,

    orderController.downloadInvoice

);

router.post(

'/apply-coupon',

isLoggedIn,

checkoutController.applyCoupon

);



router.post(

'/remove-coupon',

isLoggedIn,

checkoutController.removeCoupon

);
module.exports = router;