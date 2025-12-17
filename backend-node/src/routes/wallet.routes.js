const express = require('express');
const { getBalance, getTransactions, getSummary, getTrends } = require('../controllers/wallet.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/balance', protect, getBalance);
router.get('/transactions', protect, getTransactions);
router.get('/transactions/summary', protect, getSummary);
router.get('/transactions/trends', protect, getTrends);

module.exports = router;
