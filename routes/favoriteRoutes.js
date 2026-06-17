const express = require('express');

const router = express.Router();

const {
    getFavorites,
    createFavorite
} = require('../controllers/favoriteController');

router.get('/', getFavorites);

router.post('/', createFavorite);

module.exports = router;