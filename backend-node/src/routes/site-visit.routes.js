const express = require('express');
const {
    getAll,
    getById,
    create
} = require('../controllers/site-visit.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, getAll);
router.post('/', protect, create);
router.get('/:id', protect, getById);

module.exports = router;
