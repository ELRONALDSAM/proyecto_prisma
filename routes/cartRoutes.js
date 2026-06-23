const express = require('express');

const router = express.Router();

const {
  getCart,
  createCart,
  deleteCart,
  deleteUserCart
} = require('../controllers/cartController');

router.get('/', getCart);
router.post('/', createCart);
router.delete('/', deleteUserCart);
router.delete('/:id', deleteCart);

module.exports = router;