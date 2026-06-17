const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAllCategories = async () => {
    return await prisma.category.findMany();
};

module.exports = {
    getAllCategories
};