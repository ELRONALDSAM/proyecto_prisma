const prisma = require('../lib/prisma');

const getAllOrders = async () => {
  return await prisma.order.findMany();
};

module.exports = {
  getAllOrders
};