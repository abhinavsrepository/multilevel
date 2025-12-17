const express = require('express');
const {
    getMyClubStatus,
    getMyClubIncome,
    getAllClubMembers,
    getClubStatistics,
    updateUserClubStatus,
    distributeMonthlyRoyalty
} = require('../controllers/club.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// User routes
router.get('/status', protect, getMyClubStatus);
router.get('/income', protect, getMyClubIncome);

// Admin routes
router.get('/members', protect, authorize('ADMIN'), getAllClubMembers);
router.get('/statistics', protect, authorize('ADMIN'), getClubStatistics);
router.post('/update/:userId', protect, authorize('ADMIN'), updateUserClubStatus);
router.post('/distribute-royalty', protect, authorize('ADMIN'), distributeMonthlyRoyalty);

module.exports = router;
