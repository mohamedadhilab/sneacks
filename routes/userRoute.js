const express = require('express');
const router = express.Router();
const passport = require('passport');

const upload = require('../middleware/upload');

const authController = require('../controllers/user/authController');
const profileController = require('../controllers/user/profileController');
const addressController = require('../controllers/user/addressController');

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
  '/login',
  isLoggedOut,
  noCache,
  (req, res) => {
    res.render('user/login');
  }
);

router.get(
  '/signup',
  isLoggedOut,
  noCache,
  (req, res) => {
    res.render('user/signup');
  }
);

router.get(
  '/forgot-password',
  isLoggedOut,
  noCache,
  (req, res) => {
    res.render('user/forgot-password');
  }
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

router.post(
  '/update-address/:id',
  isLoggedIn,
  validate(userValidation.addressSchema),
  addressController.updateAddress
);

router.get(
  '/delete-address/:id',
  isLoggedIn,
  addressController.deleteAddress
);


module.exports = router;