const express = require('express');
const router = express.Router();
const clubBonusController = require('../controllers/user/club-bonus.controller');
const { protect } = require('../middleware/auth.middleware');

// User routes (all require authentication)
router.use(protect);

// Get all active club tiers
router.get('/tiers', clubBonusController.getClubTiers);

// Get user's qualification history
router.get('/my-qualifications', clubBonusController.getMyQualifications);

// Check current qualification status
router.get('/check-status', clubBonusController.checkMyStatus);

// Get team business breakdown
router.get('/team-business', clubBonusController.getTeamBusiness);

// Get dashboard summary
router.get('/dashboard', clubBonusController.getDashboard);

module.exports = router;
