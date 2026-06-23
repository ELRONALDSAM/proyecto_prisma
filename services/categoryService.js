const prisma = require('../lib/prisma');

const getAllCategories = async () => {
  return await prisma.category.findMany();
};

module.exports = {
  getAllCategories
};