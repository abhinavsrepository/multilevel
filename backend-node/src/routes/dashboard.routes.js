const express = require('express');
const {
    getStats,
    getRevenueChart,
    getLeadPipeline,
    getTodayFollowUps
} = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/stats', protect, getStats);
router.get('/revenue-chart', protect, getRevenueChart);
router.get('/lead-pipeline', protect, getLeadPipeline);
router.get('/today-follow-ups', protect, getTodayFollowUps);

module.exports = router;
