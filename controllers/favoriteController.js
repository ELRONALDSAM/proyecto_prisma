const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getFavorites = async (req, res) => {
  try {

    const favorites = await prisma.favorite.findMany();

    res.json(favorites);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });

  }
};

const createFavorite = async (req, res) => {
  try {

    console.log('BODY RECIBIDO:', req.body);

    const { userId, productId } = req.body;

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        productId
      }
    });

    console.log('FAVORITO GUARDADO:', favorite);

    res.status(201).json(favorite);

  } catch (error) {

    console.error('ERROR FAVORITE:', error);

    res.status(500).json({
      error: error.message
    });

  }
};

module.exports = {
  getFavorites,
  createFavorite
};