const prisma = require('../lib/prisma');

const getAllCarts = async () => {
  return await prisma.cart.findMany();
};

module.exports = {
  getAllCarts
};


