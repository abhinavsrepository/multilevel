const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');

const incomeController = require('../controllers/user/income.controller');
const adminIncomeController = require('../controllers/admin/income.admin.controller');

// User routes
router.get('/', protect, incomeController.getIncomeHistory);
router.get('/dashboard', protect, incomeController.getDashboardStats);
router.get('/level-overview', protect, incomeController.getLevelOverview);
router.get('/history', protect, incomeController.getIncomeHistory);
router.get('/daily', protect, incomeController.getDailyIncome);
router.get('/team-hierarchy', protect, incomeController.getTeamHierarchy);

// Admin routes
// Admin routes
router.get('/admin/summary', protect, authorize('ADMIN'), adminIncomeController.getIncomeSummary);
router.get('/admin/stats', protect, authorize('ADMIN'), adminIncomeController.getAdminIncomeStats);
router.get('/admin/export-summary', protect, authorize('ADMIN'), adminIncomeController.exportIncomeSummary);
router.get('/admin/type/:incomeType', protect, authorize('ADMIN'), adminIncomeController.getIncomeByType);

module.exports = router;
