const express = require('express');
const { fixSchema, fixRanks } = require('../controllers/fix.controller');

const router = express.Router();

// Public routes for emergency fixing (Add auth if sensitive)
router.get('/schema', fixSchema);
router.get('/ranks', fixRanks);

module.exports = router;
