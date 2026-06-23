const prisma = require('../lib/prisma');

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    console.error('ERROR GET CATEGORIES:', error);
    res.status(500).json({
      error: error.message
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
    }

    const newCategory = await prisma.category.create({
      data: {
        name
      }
    });

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('ERROR CREATE CATEGORY:', error);
    res.status(500).json({
      error: error.message
    });
  }
};

module.exports = {
  getCategories,
  createCategory
};