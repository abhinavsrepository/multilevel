const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/users', (req, res, next) => {
    console.log('GET /users route hit');
    adminController.getAllUsers(req, res, next);
});

router.post('/users', adminController.createUser);

router.put('/users/:id/activate', adminController.activateUser);
router.put('/users/:id/block', adminController.blockUser);
router.put('/users/:id/unblock', adminController.unblockUser);
router.put('/users/:id/reset-password', adminController.resetUserPassword);
router.put('/users/bulk-activate', adminController.bulkActivate);
router.put('/users/bulk-block', adminController.bulkBlock);
router.delete('/users/bulk-delete', adminController.bulkDelete);
router.get('/users/export', adminController.exportUsers);
router.get('/users/:id/activity-logs', adminController.getUserActivityLogs);
router.get('/users/:id/investments', adminController.getUserInvestments);
router.get('/users/:id/commissions', adminController.getUserCommissions);
router.get('/users/:id/payouts', adminController.getUserPayouts);
router.get('/users/:id/tickets', adminController.getUserTickets);

router.get('/dashboard', adminController.getAdminDashboard);

router.get('/payouts/pending', adminController.getPendingPayouts);
router.put('/payouts/:payoutId/approve', adminController.approvePayout);
router.put('/payouts/:payoutId/reject', adminController.rejectPayout);

router.get('/kyc/pending', adminController.getPendingKyc);
router.put('/kyc/:id/approve', adminController.approveKyc);

router.put('/kyc/:id/reject', adminController.rejectKyc);

// Property Routes
const adminPropertyController = require('../controllers/admin-property.controller');
router.get('/properties', adminPropertyController.getProperties);
router.put('/properties/:id/status', adminPropertyController.updatePropertyStatus);
router.put('/properties/:id/toggle-featured', adminPropertyController.toggleFeatured);
router.put('/properties/:id/toggle-trending', adminPropertyController.toggleTrending);
router.get('/properties/:id/investors', adminPropertyController.getPropertyInvestors);
router.get('/properties/export', adminPropertyController.exportProperties);

// Investment Routes
const adminInvestmentController = require('../controllers/admin-investment.controller');
router.get('/investments/stats', adminInvestmentController.getInvestmentStats);
router.get('/investments', adminInvestmentController.getInvestments);
router.put('/investments/:id/approve', adminInvestmentController.approveInvestment);
router.put('/investments/:id/reject', adminInvestmentController.rejectInvestment);
router.put('/investments/:id/cancel', adminInvestmentController.cancelInvestment);
router.get('/investments/:id/installments', adminInvestmentController.getInstallments);
router.put('/investments/:id/installments/:installmentId/paid', adminInvestmentController.markInstallmentPaid);
router.get('/investments/export', adminInvestmentController.exportInvestments);

// Payout Routes (Advanced)
const adminPayoutController = require('../controllers/admin-payout.controller');
router.get('/payouts', adminPayoutController.getPayouts);
router.put('/payouts/:id/request-info', adminPayoutController.requestMoreInfo);
router.post('/payouts/batch-process', adminPayoutController.batchProcess);
router.post('/payouts/:id/retry', adminPayoutController.retryPayout);
router.get('/payouts/export', adminPayoutController.exportPayouts);
router.get('/payouts/statistics', adminPayoutController.getPayoutStats);

// Analytics Routes
const adminAnalyticsController = require('../controllers/admin-analytics.controller');
router.get('/analytics/properties', adminAnalyticsController.getPropertyAnalytics);
router.get('/analytics/users', adminAnalyticsController.getUserAnalytics);
router.get('/analytics/financial', adminAnalyticsController.getFinancialAnalytics);
router.get('/analytics/activities', adminAnalyticsController.getRecentActivities);
router.get('/analytics/charts/:chartType', adminAnalyticsController.getChartData);

module.exports = router;
