const express = require('express');
const router = express.Router();
const rankAchievementController = require('../controllers/rank-achievement.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// User routes - Protected, accessible to authenticated users
router.use(protect);

router.get('/my-achievements', rankAchievementController.getMyAchievements);
router.get('/my-timeline', rankAchievementController.getMyAchievementTimeline);

// Admin routes - Protected, admin only
router.get('/all', authorize('ADMIN'), rankAchievementController.getAllAchievements);
router.get('/user/:userId', authorize('ADMIN'), rankAchievementController.getUserAchievements);
router.get('/stats', authorize('ADMIN'), rankAchievementController.getRankStats);
router.post('/award', authorize('ADMIN'), rankAchievementController.awardRankToUser);

module.exports = router;
