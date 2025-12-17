const express = require('express');
const router = express.Router();
const topupController = require('../controllers/topup.controller');
const { protect } = require('../middleware/auth.middleware'); // Assuming auth middleware exists

router.get('/packages', topupController.getMainPackages);
router.post('/', protect, topupController.createTopup);
router.get('/history', protect, topupController.getTopupHistory);

module.exports = router;
