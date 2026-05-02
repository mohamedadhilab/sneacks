const express = require('express');
const router = express.Router();
const passport = require('passport');

const upload = require('../middleware/upload');
const userController = require('../controllers/userController');

const { isLoggedIn } = require('../middleware/authMiddleware');
const noCache = require('../middleware/noCache');



router.get('/', (req, res) => {
  res.redirect('/login');
});

router.get('/login', noCache, (req, res) => {
  res.render('login');
});

router.get('/signup', noCache, (req, res) => {
  res.render('signup');
});

router.get('/forgot-password', noCache, (req, res) => {
  res.render('forgot-password', { error: null });
});


router.post('/signup', userController.signup);
router.post('/login', userController.login);

router.post('/forgot-password', userController.forgotPassword);



router.get('/otp', userController.getOtpPage);
router.post('/verify-otp', userController.verifyOtp);
router.get('/resend-otp', userController.resendOtp);


router.get('/reset-password', userController.getResetPage);
router.post('/reset-password', userController.resetPassword);



router.get('/home', isLoggedIn,noCache, (req, res) => {
  res.render('home');
});


router.get('/logout', userController.logout);

router.get('/profile', isLoggedIn, noCache, async (req, res) => {
  const user = await require('../models/userModel').findById(req.session.user.id);
  res.render('profile', { user });
});

router.post(
  '/update-profile',
  isLoggedIn,
  upload.single('profileImage'),
  userController.updateProfile
);

router.post('/update-password', isLoggedIn, userController.updatePassword);

router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  (req, res) => {

if (!req.user) {
  return res.redirect('/login');
}

req.session.user = {
  id: req.user._id,
  name: req.user.name,
  email: req.user.email
}

    res.redirect('/home');
  }
);



module.exports = router;