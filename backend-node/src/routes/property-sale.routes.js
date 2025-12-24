const express = require('express');
const router = express.Router();
const propertySaleController = require('../controllers/user/property-sale.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// Submit a new property sale
router.post('/', propertySaleController.createSale);

// Get my sales (as employee)
router.get('/my-sales', propertySaleController.getMySales);

// Get my purchases (as buyer)
router.get('/my-purchases', propertySaleController.getMyPurchases);

// Get sale details
router.get('/:id', propertySaleController.getSaleDetails);

module.exports = router;
