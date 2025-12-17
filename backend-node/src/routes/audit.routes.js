const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, authorize('ADMIN'), auditController.getAuditLogs);

module.exports = router;
