const express = require('express');
const router = express.Router();
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const authenticateToken = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.get('/', getProducts);
router.post('/', authenticateToken, adminMiddleware, createProduct);
router.put('/:id', authenticateToken, adminMiddleware, updateProduct);
router.delete('/:id', authenticateToken, adminMiddleware, deleteProduct);

module.exports = router;