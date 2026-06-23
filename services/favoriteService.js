const prisma = require('../lib/prisma');

const getAllFavorites = async () => {
  return await prisma.favorite.findMany();
};

module.exports = {
  getAllFavorites
};