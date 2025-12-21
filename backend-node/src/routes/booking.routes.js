const express = require('express');
const {
    getMyBookings,
    getMyBookingById,
    getEMISchedule
} = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/my-bookings', protect, getMyBookings);
router.get('/my-bookings/:id', protect, getMyBookingById);
router.get('/:bookingId/emi-schedule', protect, getEMISchedule);

module.exports = router;
