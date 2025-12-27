const express = require('express');
const {
    uploadProfilePhoto,
    uploadKYCDocument,
    deleteFile
} = require('../controllers/upload.controller');
const profileUpload = require('../middleware/profile-upload.middleware');
const kycUpload = require('../middleware/upload.middleware');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// ==================== Public Routes ====================

// Profile photo upload (public - for registration)
router.post('/profile-photo', profileUpload.single('profilePhoto'), uploadProfilePhoto);

// Generic document upload (public for now, or use protect if needed)
const { uploadDocument } = require('../controllers/upload.controller');
router.post('/document', kycUpload.single('file'), uploadDocument);

// ==================== Protected Routes ====================

// KYC document upload (protected)
router.post('/kyc-document', protect, kycUpload.single('document'), uploadKYCDocument);

// Delete file
router.delete('/:filename', protect, deleteFile);

module.exports = router;
