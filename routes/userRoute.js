const express = require('express');
const router = express.Router();
const passport = require('passport');

const userController = require('../controllers/userController');




router.get('/', (req, res) => {
  res.redirect('/login');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { error: null });
});



router.post('/signup', userController.signup);

router.post('/login', userController.login);



router.get('/otp', userController.getOtpPage);

router.post('/verify-otp', userController.verifyOtp);

router.get('/resend-otp', userController.resendOtp);




router.post('/forgot-password', userController.forgotPassword);

router.get('/reset-password', userController.getResetPage);

router.post('/reset-password', userController.resetPassword);



router.get('/home', (req, res) => {
  res.render('home');
});


router.get('/logout', userController.logout);


// start Google login
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// callback
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  (req, res) => {
    res.redirect('/home');
  }
);


module.exports = router;