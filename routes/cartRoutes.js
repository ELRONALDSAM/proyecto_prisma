const express = require('express');

const router = express.Router();

const {
  getCart,
  createCart
} = require('../controllers/cartController');

router.get('/', getCart);

router.post('/', createCart);

module.exports = router;