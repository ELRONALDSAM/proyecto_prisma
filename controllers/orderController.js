const prisma = require('../lib/prisma');

const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany();
    res.json(orders);
  } catch (error) {
    console.error('ERROR GET ORDERS:', error);
    res.status(500).json({
      error: error.message
    });
  }
};

const createOrder = async (req, res) => {
  try {
    console.log('[createOrder] datos recibidos:', req.body);
    const { userId, total } = req.body;

    if (!userId || total === undefined) {
      return res.status(400).json({ error: 'userId y total son requeridos' });
    }

    const newOrder = await prisma.order.create({
      data: {
        userId: parseInt(userId),
        total: parseFloat(total)
      }
    });

    console.log('[createOrder] orden creada:', newOrder);

    // Vaciar el carrito
    await prisma.cart.deleteMany({
      where: {
        userId: parseInt(userId)
      }
    });

    console.log('[createOrder] carrito vaciado correctamente');

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('ERROR CREATE ORDER:', error);
    res.status(500).json({
      error: error.message
    });
  }
};

module.exports = {
  getOrders,
  createOrder
};