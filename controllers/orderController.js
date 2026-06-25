const prisma = require('../lib/prisma');
const orderService = require('../services/orderServices');

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
    console.log('[createOrder] datos recibidos en req.body:', req.body);
    const { userId, total, telefono, direccion, ciudad, departamento, notas } = req.body;

    if (!userId || total === undefined) {
      return res.status(400).json({ error: 'userId y total son requeridos' });
    }

    const orderData = {
      userId,
      total,
      telefono,
      direccion,
      ciudad,
      departamento,
      notas
    };

    console.log('[createOrder] enviando datos al servicio:', orderData);
    const newOrder = await orderService.createOrder(orderData);

    console.log('[createOrder] orden creada con éxito:', newOrder);

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