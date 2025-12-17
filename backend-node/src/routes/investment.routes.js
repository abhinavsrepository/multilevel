const express = require('express');
const {
    createInvestment,
    getMyInvestments,
    getInvestmentDetails,
    getPortfolioSummary,
    getInvestmentStats
} = require('../controllers/investment.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', protect, createInvestment);
router.get('/', protect, getMyInvestments);
router.get('/my-investments', protect, getMyInvestments);
router.get('/portfolio', protect, getPortfolioSummary);
router.get('/stats', protect, getInvestmentStats);
router.get('/:id', protect, getInvestmentDetails);
router.post('/:id/exit', protect, require('../controllers/investment.controller').requestExit);

module.exports = router;
