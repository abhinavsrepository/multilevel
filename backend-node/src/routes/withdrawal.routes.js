const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');

// Admin controllers
const adminWithdrawalController = require('../controllers/admin/withdrawal.admin.controller');

// User controllers
const userWithdrawalController = require('../controllers/user/withdrawal.controller');

// Admin routes
router.get('/admin', protect, authorize('ADMIN'), adminWithdrawalController.getAllWithdrawals);
router.get('/admin/pending', protect, authorize('ADMIN'), adminWithdrawalController.getPendingWithdrawals);
router.get('/admin/stats', protect, authorize('ADMIN'), adminWithdrawalController.getWithdrawalStats);
router.post('/admin/:id/approve', protect, authorize('ADMIN'), adminWithdrawalController.approveWithdrawal);
router.post('/admin/:id/reject', protect, authorize('ADMIN'), adminWithdrawalController.rejectWithdrawal);
router.post('/admin/:id/complete', protect, authorize('ADMIN'), adminWithdrawalController.completeWithdrawal);

// User routes
router.post('/', protect, userWithdrawalController.requestWithdrawal);
router.get('/my-withdrawals', protect, userWithdrawalController.getMyWithdrawals);
router.get('/limits', protect, userWithdrawalController.getWithdrawalLimits);
router.get('/calculate-charges', protect, userWithdrawalController.calculateCharges);
router.get('/:id', protect, userWithdrawalController.getWithdrawalDetails);
router.delete('/:id/cancel', protect, userWithdrawalController.cancelWithdrawal);

module.exports = router;
