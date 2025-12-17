const express = require('express');
const {
    getMatchingBonusHistory,
    getMatchingBonusSourceDetails,
    getMatchingEligibility,
    calculateCurrentCycleBonus,
    exportMatchingBonus
} = require('../controllers/user/matching-bonus.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// User routes
router.get('/history', getMatchingBonusHistory);
router.get('/eligibility', getMatchingEligibility);
router.get('/calculate-current', calculateCurrentCycleBonus);
router.get('/export', exportMatchingBonus);
router.get('/:incomeId/details', getMatchingBonusSourceDetails);

module.exports = router;
