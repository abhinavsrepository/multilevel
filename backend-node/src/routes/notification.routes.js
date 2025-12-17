const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, notificationController.getNotifications);
router.put('/:id/read', protect, notificationController.markAsRead);
router.put('/read-all', protect, notificationController.markAllAsRead);
router.post('/send', protect, authorize('ADMIN'), notificationController.sendManualNotification);
router.get('/settings', protect, notificationController.getNotificationSettings);
router.put('/settings', protect, notificationController.updateNotificationSettings);

module.exports = router;
