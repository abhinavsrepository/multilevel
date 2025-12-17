const express = require('express');
const { updateProfile, changePassword, getDashboard, getReferralLink, getProfile, getSessions, getLoginHistory, getSettings, updateSettings } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/dashboard', protect, getDashboard);
router.get('/profile', protect, getProfile);
router.get('/referral-link', protect, getReferralLink);
router.get('/sessions', protect, getSessions);
router.get('/login-history', protect, getLoginHistory);

router.get('/settings', protect, getSettings);
router.put('/settings', protect, updateSettings);

module.exports = router;
