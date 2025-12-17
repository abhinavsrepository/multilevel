const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');

// Admin controllers
const adminEPinController = require('../controllers/admin/epin.admin.controller');

// User controllers
const userEPinController = require('../controllers/user/epin.controller');

// Admin routes
router.post('/admin/generate', protect, authorize('ADMIN'), adminEPinController.generateEPins);
router.get('/admin', protect, authorize('ADMIN'), adminEPinController.getAllEPins);
router.get('/admin/stats', protect, authorize('ADMIN'), adminEPinController.getEPinStats);
router.put('/admin/:id/toggle', protect, authorize('ADMIN'), adminEPinController.toggleEPinStatus);
router.delete('/admin/:id', protect, authorize('ADMIN'), adminEPinController.deleteEPin);

// User routes
router.post('/generate', protect, userEPinController.generateEPinFromWallet);
router.get('/my-pins', protect, userEPinController.getMyEPins);
router.get('/stats', protect, userEPinController.getMyEPinStats);
router.post('/verify', protect, userEPinController.verifyEPin);
router.post('/activate', protect, userEPinController.activateUserWithEPin);

module.exports = router;
