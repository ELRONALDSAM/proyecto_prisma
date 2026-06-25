const prisma = require('../lib/prisma');

const getAllOrders = async () => {
  return await prisma.order.findMany();
};

const createOrder = async (orderData) => {
  console.log('[orderService] datos enviados a Prisma:', orderData);
  return await prisma.order.create({
    data: {
      userId: parseInt(orderData.userId),
      total: parseFloat(orderData.total),
      telefono: orderData.telefono || null,
      direccion: orderData.direccion || null,
      ciudad: orderData.ciudad || null,
      departamento: orderData.departamento || null,
      notas: orderData.notas || null
    }
  });
};

module.exports = {
  getAllOrders,
  createOrder
};