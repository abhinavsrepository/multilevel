const express = require('express');
const {
    getAllRegistrations,
    getRegistrationById,
    createRegistration,
    updateRegistration,
    deleteRegistration,
    approveRegistration,
    rejectRegistration,
    getRegistrationStats,
    exportRegistrations
} = require('../controllers/admin/registration.admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Admin routes
router.get('/admin', protect, authorize('ADMIN'), getAllRegistrations);
router.get('/admin/stats', protect, authorize('ADMIN'), getRegistrationStats);
router.get('/admin/export', protect, authorize('ADMIN'), exportRegistrations);
router.get('/admin/:id', protect, authorize('ADMIN'), getRegistrationById);
router.post('/admin', protect, authorize('ADMIN'), createRegistration);
router.put('/admin/:id', protect, authorize('ADMIN'), updateRegistration);
router.delete('/admin/:id', protect, authorize('ADMIN'), deleteRegistration);
router.post('/admin/:id/approve', protect, authorize('ADMIN'), approveRegistration);
router.post('/admin/:id/reject', protect, authorize('ADMIN'), rejectRegistration);

module.exports = router;
