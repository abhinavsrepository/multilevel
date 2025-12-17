const express = require('express');
const {
    createBonanza,
    getAllBonanzas,
    getActiveBonanzas,
    getBonanzaById,
    updateBonanza,
    deleteBonanza,
    getMyBonanzaAchievements,
    getBonanzaQualifiers
} = require('../controllers/bonanza.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// User routes
router.get('/active', protect, getActiveBonanzas);
router.get('/achievements', protect, getMyBonanzaAchievements);

// Admin routes
router.post('/', protect, authorize('ADMIN'), createBonanza);
router.get('/', protect, authorize('ADMIN'), getAllBonanzas);
router.get('/:id', protect, authorize('ADMIN'), getBonanzaById);
router.put('/:id', protect, authorize('ADMIN'), updateBonanza);
router.delete('/:id', protect, authorize('ADMIN'), deleteBonanza);
router.get('/:id/qualifiers', protect, authorize('ADMIN'), getBonanzaQualifiers);

module.exports = router;
