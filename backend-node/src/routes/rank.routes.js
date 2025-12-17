const express = require('express');
const router = express.Router();
const rankController = require('../controllers/rank.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public/User routes
router.get('/available', protect, rankController.getAvailableRanks);
router.get('/progress', protect, rankController.getUserRankProgress);

// Admin routes
router.use(protect, authorize('ADMIN'));

router
    .route('/')
    .get(rankController.getAllRanks)
    .post(rankController.createRank);

router
    .route('/:id')
    .patch(rankController.updateRank)
    .delete(rankController.deleteRank);

router.post('/assign', rankController.assignRankToUser);

module.exports = router;
