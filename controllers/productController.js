const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getProducts = async (req, res) => {

    const products = await prisma.product.findMany();

    res.json(products);

};

const createProduct = async (req, res) => {

    const { nombre, precio, stock } = req.body;

    const newProduct = await prisma.product.create({
        data: {
            nombre,
            precio,
            stock
        }
    });

    res.status(201).json(newProduct);

};

module.exports = {
    getProducts,
    createProduct
};