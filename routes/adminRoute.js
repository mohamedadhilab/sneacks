const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin/adminController');
const adminAuth = require('../middleware/adminAuth');

// ===== AUTH =====
router.get('/login', adminController.getLogin);
router.post('/login', adminController.login);
router.get('/logout', adminController.logout);

// ===== FORGOT PASSWORD =====
router.get('/forgot-password', adminController.getForgotPasswordPage);
router.post('/forgot-password', adminController.forgotPassword);

router.get('/otp', adminController.getOtpPage);
router.post('/verify-otp', adminController.verifyOtp);

router.get('/reset-password', adminController.getResetPage);
router.post('/reset-password', adminController.resetPassword);

// ===== DASHBOARD (PROTECTED) =====
router.get('/dashboard', adminAuth, adminController.getDashboard);

// ===== USER MANAGEMENT =====
router.get('/users', adminAuth, adminController.getUsers);
router.get('/block-user/:id', adminAuth, adminController.blockUser);
router.get('/unblock-user/:id', adminAuth, adminController.unblockUser);
router.get('/user/:id', adminController.getUserDetails);

module.exports = router;