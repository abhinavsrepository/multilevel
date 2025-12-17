const express = require('express');
const {
    getLevelBonusEligibility,
    getLevelBonusHistory,
    getDirectSalesHistory
} = require('../controllers/level-bonus.controller');
const {
    getAllLevelBonuses,
    getLevelBonusStats,
    approveLevelBonus,
    rejectLevelBonus,
    markDirectSaleComplete,
    createDirectSalesCommission
} = require('../controllers/admin/level-bonus.admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// User routes
router.get('/eligibility', protect, getLevelBonusEligibility);
router.get('/history', protect, getLevelBonusHistory);
router.get('/direct-sales', protect, getDirectSalesHistory);

// Admin routes
router.get('/admin', protect, authorize('ADMIN'), getAllLevelBonuses);
router.get('/admin/stats', protect, authorize('ADMIN'), getLevelBonusStats);
router.post('/admin/:id/approve', protect, authorize('ADMIN'), approveLevelBonus);
router.post('/admin/:id/reject', protect, authorize('ADMIN'), rejectLevelBonus);
router.post('/admin/user/:userId/direct-sale', protect, authorize('ADMIN'), markDirectSaleComplete);
router.post('/admin/direct-sales-commission', protect, authorize('ADMIN'), createDirectSalesCommission);

module.exports = router;
