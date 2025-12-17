const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');

// Admin controllers
const adminDepositController = require('../controllers/admin/deposit.admin.controller');

// User controllers
const userDepositController = require('../controllers/user/deposit.controller');

// Admin routes
router.get('/admin', protect, authorize('ADMIN'), adminDepositController.getAllDeposits);
router.get('/admin/pending', protect, authorize('ADMIN'), adminDepositController.getPendingDeposits);
router.get('/admin/stats', protect, authorize('ADMIN'), adminDepositController.getDepositStats);
router.post('/admin/:id/approve', protect, authorize('ADMIN'), adminDepositController.approveDeposit);
router.post('/admin/:id/reject', protect, authorize('ADMIN'), adminDepositController.rejectDeposit);

// User routes
router.post('/', protect, userDepositController.submitDepositRequest);
router.post('/upload-proof', protect, userDepositController.uploadPaymentProof);
router.get('/my-deposits', protect, userDepositController.getMyDeposits);
router.get('/:id', protect, userDepositController.getDepositDetails);
router.delete('/:id/cancel', protect, userDepositController.cancelDeposit);

module.exports = router;
