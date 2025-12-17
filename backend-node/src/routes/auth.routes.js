const express = require('express');
const {
    register,
    login,
    getMe,
    validateSponsor,
    sendEmailOTP,
    sendMobileOTP,
    verifyOTP,
    resendOTP,
    forgotPassword,
    validateResetToken,
    resetPassword,
    changePassword,
    sendEmailVerification,
    verifyEmail,
    sendMobileVerification,
    verifyMobile,
    checkEmailExists,
    checkMobileExists,
    logout,
    refreshToken
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// ==================== Public Routes ====================

// Registration & Login
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Sponsor Validation
router.get('/validate-sponsor/:sponsorId', validateSponsor);

// OTP Routes
router.post('/send-otp/email', sendEmailOTP);
router.post('/send-otp/mobile', sendMobileOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Password Management
router.post('/forgot-password', forgotPassword);
router.get('/validate-reset-token/:token', validateResetToken);
router.post('/reset-password', resetPassword);

// Account Status Checks
router.get('/check-email/:email', checkEmailExists);
router.get('/check-mobile/:mobile', checkMobileExists);

// ==================== Protected Routes ====================

// User Info
router.get('/me', protect, getMe);

// Password Change (requires authentication)
router.post('/change-password', protect, changePassword);

// Email/Mobile Verification (requires authentication)
router.post('/send-email-verification', protect, sendEmailVerification);
router.post('/verify-email', protect, verifyEmail);
router.post('/send-mobile-verification', protect, sendMobileVerification);
router.post('/verify-mobile', protect, verifyMobile);

// Token Management
router.post('/refresh-token', protect, refreshToken);

module.exports = router;
