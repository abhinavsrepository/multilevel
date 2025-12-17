const express = require('express');
const router = express.Router();
const bankAccountController = require('../controllers/bank-account.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/', bankAccountController.addBankAccount);
router.get('/', bankAccountController.getBankAccounts);
router.put('/:id', bankAccountController.updateBankAccount);
router.delete('/:id', bankAccountController.deleteBankAccount);
router.put('/:id/set-primary', bankAccountController.setPrimaryAccount);

module.exports = router;
