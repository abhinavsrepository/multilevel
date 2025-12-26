const express = require('express');
const router = express.Router();
const propertySaleController = require('../controllers/user/property-sale.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// Submit a new property sale
router.post('/', propertySaleController.createSale);

// Proclaim a property sale (Associate selling to buyer)
router.post('/proclaim', propertySaleController.proclaimSale);

// Calculate projected earnings for a potential sale
router.post('/calculate-earnings', propertySaleController.calculateProjectedEarnings);

// Get user's sale statistics
router.get('/stats', propertySaleController.getUserSaleStats);

// Get my sales (as employee)
router.get('/my-sales', propertySaleController.getMySales);

// Get my purchases (as buyer)
router.get('/my-purchases', propertySaleController.getMyPurchases);

// Get sale details
router.get('/:id', propertySaleController.getSaleDetails);

module.exports = router;
