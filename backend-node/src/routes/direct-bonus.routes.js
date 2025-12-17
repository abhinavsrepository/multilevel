const express = require('express');
const {
    getDirectBonusStats,
    getDirectBonusLog,
    getFastStartBonus,
    updateFastStartProgress,
    getDirectReferrals
} = require('../controllers/direct-bonus.controller');
const {
    getAllDirectBonuses,
    createDirectBonus,
    approveDirectBonus,
    rejectDirectBonus,
    getAllFastStartBonuses,
    createFastStartBonus,
    getDirectBonusStats: adminGetStats
} = require('../controllers/admin/direct-bonus.admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// User routes
router.get('/stats', protect, getDirectBonusStats);
router.get('/log', protect, getDirectBonusLog);
router.get('/fast-start', protect, getFastStartBonus);
router.post('/fast-start/update', protect, updateFastStartProgress);
router.get('/referrals', protect, getDirectReferrals);

// Admin routes
router.get('/admin', protect, authorize('ADMIN'), getAllDirectBonuses);
router.get('/admin/stats', protect, authorize('ADMIN'), adminGetStats);
router.post('/admin', protect, authorize('ADMIN'), createDirectBonus);
router.post('/admin/:id/approve', protect, authorize('ADMIN'), approveDirectBonus);
router.post('/admin/:id/reject', protect, authorize('ADMIN'), rejectDirectBonus);
router.get('/admin/fast-start', protect, authorize('ADMIN'), getAllFastStartBonuses);
router.post('/admin/fast-start', protect, authorize('ADMIN'), createFastStartBonus);

module.exports = router;
