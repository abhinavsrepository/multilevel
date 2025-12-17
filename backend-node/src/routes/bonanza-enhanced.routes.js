const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');

// Import controllers
const adminBonanzaController = require('../controllers/admin/bonanza.admin.controller');
const userBonanzaController = require('../controllers/user/bonanza.user.controller');

/**
 * USER ROUTES
 * All routes are protected (require authentication)
 */

// Get bonanza summary for dashboard widget
router.get('/summary', protect, userBonanzaController.getBonanzaSummary);

// Get all active bonanzas
router.get('/active', protect, userBonanzaController.getActiveBonanzas);

// Get upcoming bonanzas
router.get('/upcoming', protect, userBonanzaController.getUpcomingBonanzas);

// Get my bonanza achievements/history
router.get('/my-achievements', protect, userBonanzaController.getMyAchievements);

// Trigger qualification check manually
router.post('/check-qualification', protect, userBonanzaController.checkQualification);

// Get detailed progress for specific bonanza
router.get('/:id/my-progress', protect, userBonanzaController.getMyProgress);

// Get leaderboard for specific bonanza
router.get('/:id/leaderboard', protect, userBonanzaController.getLeaderboard);

/**
 * ADMIN ROUTES
 * All routes require admin authorization
 */

// Get bonanza statistics overview
router.get('/admin/statistics', protect, authorize('ADMIN'), adminBonanzaController.getBonanzaStatistics);

// Update bonanza statuses manually
router.post('/admin/update-statuses', protect, authorize('ADMIN'), adminBonanzaController.updateStatuses);

// Get all bonanzas with filters
router.get('/admin', protect, authorize('ADMIN'), adminBonanzaController.getAllBonanzas);

// Create new bonanza
router.post('/admin', protect, authorize('ADMIN'), adminBonanzaController.createBonanza);

// Get single bonanza by ID with detailed stats
router.get('/admin/:id', protect, authorize('ADMIN'), adminBonanzaController.getBonanzaById);

// Update bonanza
router.put('/admin/:id', protect, authorize('ADMIN'), adminBonanzaController.updateBonanza);

// Delete bonanza
router.delete('/admin/:id', protect, authorize('ADMIN'), adminBonanzaController.deleteBonanza);

// Get bonanza qualifiers (participants)
router.get('/admin/:id/qualifiers', protect, authorize('ADMIN'), adminBonanzaController.getBonanzaQualifiers);

// Get real-time tracking dashboard data
router.get('/admin/:id/dashboard', protect, authorize('ADMIN'), adminBonanzaController.getBonanzaDashboard);

// Manual award bonanza to user
router.post('/admin/:id/manual-award', protect, authorize('ADMIN'), adminBonanzaController.manualAwardBonanza);

module.exports = router;
