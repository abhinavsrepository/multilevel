const express = require('express');
const router = express.Router();
const installmentController = require('../controllers/installment.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/pending', installmentController.getPendingInstallments);
router.get('/overdue', installmentController.getOverdueInstallments);

module.exports = router;
