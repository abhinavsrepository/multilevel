const express = require('express');
const {
    requestWithdrawal,
    getPayoutHistory,
    getPayoutDetails,
    getAllPayouts,
    processPayout,
    updatePayoutAmount
} = require('../controllers/payout.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/request', protect, requestWithdrawal);
router.get('/history', protect, getPayoutHistory);
router.get('/:payoutId', protect, getPayoutDetails);

// Admin Routes
router.get('/admin/all', protect, authorize('ADMIN'), getAllPayouts);
router.put('/admin/:payoutId/process', protect, authorize('ADMIN'), processPayout);
router.put('/admin/:payoutId/adjust', protect, authorize('ADMIN'), updatePayoutAmount);

module.exports = router;
