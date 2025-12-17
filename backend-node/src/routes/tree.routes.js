const express = require('express');
const { getBinaryTree, getTreeStats } = require('../controllers/tree.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/binary', protect, getBinaryTree);
router.get('/stats', protect, getTreeStats);

module.exports = router;
