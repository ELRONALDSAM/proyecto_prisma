const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAllProducts = async () => {
    return await prisma.product.findMany();
};

module.exports = {
    getAllProducts
};