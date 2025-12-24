const express = require('express');
const commissionController = require('../controllers/commission.controller');
const commissionSettingsController = require('../controllers/commission-settings.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/history', protect, commissionController.getCommissionHistory);
router.get('/summary', protect, commissionController.getCommissionSummary);
router.get('/type/:type', protect, commissionController.getCommissionsByType);
router.get('/trends', protect, commissionController.getCommissionTrends);

// Settings routes (Admin only)
router.get('/settings', protect, authorize('ADMIN'), commissionSettingsController.getCommissionRules);
router.post('/settings', protect, authorize('ADMIN'), commissionSettingsController.updateCommissionRules);
router.post('/admin/distribute', protect, authorize('ADMIN'), commissionController.distributeCommission);

module.exports = router;
