const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAllOrders = async () => {
    return await prisma.order.findMany();
};

module.exports = {
    getAllOrders
};