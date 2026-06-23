const express = require('express');

const router = express.Router();

const {
  getFavorites,
  createFavorite,
  deleteFavorite
} = require('../controllers/favoriteController');

router.get('/', getFavorites);
router.post('/', createFavorite);
router.delete('/:id', deleteFavorite);

module.exports = router;