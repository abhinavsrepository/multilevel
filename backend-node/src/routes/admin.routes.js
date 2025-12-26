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

router.get('/users/:id', adminController.getUserById);

router.post('/users', adminController.createUser);

router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/send-notification', adminController.sendNotification);

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

router.get('/kyc/pending', adminController.getPendingKyc);
router.put('/kyc/:id/approve', adminController.approveKyc);
router.put('/kyc/:id/reject', adminController.rejectKyc);

// Investment Routes
router.get('/investments', adminController.getInvestments);
router.put('/investments/:id/approve', adminController.approveInvestment);
router.put('/investments/:id/reject', adminController.rejectInvestment);

// Property Routes
const adminPropertyController = require('../controllers/admin-property.controller');
const propertyUpload = require('../middleware/property-upload.middleware');

router.get('/properties', adminPropertyController.getProperties);
router.get('/properties/:id', adminPropertyController.getPropertyById);
router.post('/properties', adminPropertyController.createProperty);
router.put('/properties/:id', adminPropertyController.updateProperty);
router.delete('/properties/:id', adminPropertyController.deleteProperty);
router.put('/properties/:id/status', adminPropertyController.updatePropertyStatus);
router.put('/properties/:id/toggle-featured', adminPropertyController.toggleFeatured);
router.put('/properties/:id/toggle-trending', adminPropertyController.toggleTrending);
router.get('/properties/:id/investors', adminPropertyController.getPropertyInvestors);
router.get('/properties/export', adminPropertyController.exportProperties);
router.post('/properties/import', adminPropertyController.importProperties);
router.post('/properties/:id/images', propertyUpload.array('images', 10), adminPropertyController.uploadPropertyImages);
router.delete('/properties/:id/images/:imageId', adminPropertyController.deletePropertyImage);
router.post('/properties/:id/documents', propertyUpload.single('document'), adminPropertyController.uploadPropertyDocument);
router.delete('/properties/:id/documents/:documentId', adminPropertyController.deletePropertyDocument);
router.post('/properties/:id/send-update', adminPropertyController.sendUpdateToInvestors);

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
router.get('/payouts/:id', adminPayoutController.getPayoutById);
router.put('/payouts/:id/approve', adminPayoutController.approvePayout);
router.put('/payouts/:id/reject', adminPayoutController.rejectPayout);
router.put('/payouts/:id/request-info', adminPayoutController.requestMoreInfo);
router.post('/payouts/batch-process', adminPayoutController.batchProcess);
router.post('/payouts/:id/retry', adminPayoutController.retryPayout);
router.get('/payouts/:id/receipt', adminPayoutController.downloadReceipt);
router.get('/payouts/export', adminPayoutController.exportPayouts);
router.get('/payouts/statistics', adminPayoutController.getPayoutStats);

// Analytics Routes
const adminAnalyticsController = require('../controllers/admin-analytics.controller');
router.get('/analytics/properties', adminAnalyticsController.getPropertyAnalytics);
router.get('/analytics/users', adminAnalyticsController.getUserAnalytics);
router.get('/analytics/financial', adminAnalyticsController.getFinancialAnalytics);
router.get('/analytics/activities', adminAnalyticsController.getRecentActivities);
router.get('/analytics/charts/:chartType', adminAnalyticsController.getChartData);

// Club Bonus Routes
const clubBonusAdminController = require('../controllers/admin/club-bonus.admin.controller');
router.post('/club-bonus/trigger', clubBonusAdminController.triggerDistribution);
router.post('/club-bonus/initialize', clubBonusAdminController.initializeDefaultTiers);
router.get('/club-bonus/tiers', clubBonusAdminController.getClubTiers);
router.post('/club-bonus/tiers', clubBonusAdminController.createClubTier);
router.put('/club-bonus/tiers/:id', clubBonusAdminController.updateClubTier);
router.delete('/club-bonus/tiers/:id', clubBonusAdminController.deleteClubTier);
router.get('/club-bonus/qualifications', clubBonusAdminController.getQualifications);
router.get('/club-bonus/qualifications/:userId/:month/:year', clubBonusAdminController.getUserQualification);
router.post('/club-bonus/check-qualification', clubBonusAdminController.checkQualification);
router.get('/club-bonus/statistics', clubBonusAdminController.getStatistics);

// Property Sales Routes
const propertySaleAdminController = require('../controllers/admin/property-sale.admin.controller');
router.get('/property-sales', propertySaleAdminController.getAllSales);
router.get('/property-sales/pending', propertySaleAdminController.getPendingSales);
router.get('/property-sales/pending-commission', propertySaleAdminController.getPendingCommissionSales);
router.get('/property-sales/statistics', propertySaleAdminController.getSaleStatistics);
router.get('/property-sales/:id', propertySaleAdminController.getSaleDetails);
router.put('/property-sales/:id/approve', propertySaleAdminController.approveSale);
router.put('/property-sales/:id/reject', propertySaleAdminController.rejectSale);
router.put('/property-sales/:id/activate-commission', propertySaleAdminController.activateCommission);

router.post('/commissions/manual', adminController.addManualCommission);
router.post('/commissions/calculate-level-income', adminController.calculateLevelIncome);
router.post('/commissions/distribute-level-income', adminController.distributeLevelIncome);

module.exports = router;
