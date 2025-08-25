const express = require('express');
const {
  register,
  login,
  refreshToken,
  verifyEmail,
  verifyPhone,
  resendVerificationCode,
  forgotPassword,
  resetPassword,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/refresh-token', refreshToken);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/verify-phone', protect, verifyPhone);
router.post('/resend-verification', protect, resendVerificationCode);
router.post('/logout', protect, logout);

module.exports = router;