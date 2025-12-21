const express = require('express');
const {
    getAll,
    getById
} = require('../controllers/document.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, getAll);
router.get('/:id', protect, getById);

module.exports = router;
