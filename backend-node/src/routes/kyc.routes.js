const express = require('express');
const kycController = require('../controllers/kyc.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.post('/upload', protect, upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'backImage', maxCount: 1 }
]), kycController.uploadDocument);
router.get('/documents', protect, kycController.getDocuments);
router.get('/status', protect, kycController.getKycStatus);

// Admin Routes
router.get('/admin/requests', protect, authorize('ADMIN'), kycController.getAllKycRequests);
router.put('/admin/requests/:id/review', protect, authorize('ADMIN'), kycController.reviewKycRequest);

module.exports = router;
