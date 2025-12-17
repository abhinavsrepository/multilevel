const express = require('express');
const router = express.Router();
const rankRewardController = require('../controllers/rank-reward.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// User routes - Protected, accessible to authenticated users
router.use(protect);

router.get('/my-rewards', rankRewardController.getMyRewards);
router.get('/my-stats', rankRewardController.getMyRewardStats);

// Admin routes - Protected, admin only
router.get('/all', authorize('ADMIN'), rankRewardController.getAllRankRewards);
router.get('/user/:userId', authorize('ADMIN'), rankRewardController.getUserRewards);
router.post('/generate-monthly', authorize('ADMIN'), rankRewardController.generateMonthlyRewards);
router.post('/process-monthly', authorize('ADMIN'), rankRewardController.processMonthlyRewards);
router.post('/mark-paid', authorize('ADMIN'), rankRewardController.markRewardsPaid);

module.exports = router;
