const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin/adminController');

const noCache = require('../middleware/noCache');

const validate = require('../middleware/validateMiddleware');

const adminValidation = require('../validations/adminValidation');

const {
  isAdminLoggedIn,
  isAdminLoggedOut
} = require('../middleware/adminAuth');


// ===== AUTH =====
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


// ===== FORGOT PASSWORD =====
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


// ===== DASHBOARD =====
router.get(
  '/dashboard',
  isAdminLoggedIn,
  noCache,
  adminController.getDashboard
);


// ===== USER MANAGEMENT =====
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


// ===== LOGOUT =====
router.get(
  '/logout',
  isAdminLoggedIn,
  adminController.logout
);


module.exports = router;