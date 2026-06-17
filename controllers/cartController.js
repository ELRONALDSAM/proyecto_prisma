const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getCart = async (req, res) => {
  const cart = await prisma.cart.findMany();
  res.json(cart);
};

const createCart = async (req, res) => {
  try {

    const { userId, productId, quantity } = req.body;

    const cart = await prisma.cart.create({
      data: {
        userId,
        productId,
        quantity
      }
    });

    console.log('CARRITO GUARDADO:', cart);

    res.status(201).json(cart);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });

  }
};

module.exports = {
  getCart,
  createCart
};