const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');

const settingsController = require('../controllers/admin/settings.admin.controller');

// All settings routes require admin access
router.use(protect, authorize('ADMIN'));

// System settings
router.get('/', settingsController.getSystemSettings);
router.put('/update', settingsController.updateSystemSetting);
router.put('/bulk-update', settingsController.bulkUpdateSettings);

// Level commission rules
router.get('/level-rules', settingsController.getLevelCommissionRules);
router.put('/level-rules/update', settingsController.updateLevelCommissionRule);
router.put('/level-rules/bulk-update', settingsController.bulkUpdateLevelRules);

// Announcements
router.get('/announcements', settingsController.getAllAnnouncements);
router.post('/announcements', settingsController.manageAnnouncement);
router.put('/announcements/:id', settingsController.manageAnnouncement);
router.delete('/announcements/:id', settingsController.deleteAnnouncement);

module.exports = router;
