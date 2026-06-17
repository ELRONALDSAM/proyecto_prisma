const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getCategories = async (req, res) => {

    const categories = await prisma.category.findMany();

    res.json(categories);

};

const createCategory = async (req, res) => {

    const { name } = req.body;

    const newCategory = await prisma.category.create({
        data: {
            name
        }
    });

    res.status(201).json(newCategory);

};

module.exports = {
    getCategories,
    createCategory
};