const express = require('express');
const router = express.Router();

const {
    getCategories,
    createCategory
} = require('../controllers/categoryController');

const authenticateToken = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.get('/', getCategories);
router.post('/', authenticateToken, adminMiddleware, createCategory);

module.exports = router;