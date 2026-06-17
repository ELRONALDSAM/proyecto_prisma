const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAllCarts = async () => {
    return await prisma.cart.findMany();
};

module.exports = {
    getAllCarts
};
