const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getOrders = async (req, res) => {

    const orders = await prisma.order.findMany();

    res.json(orders);

};

const createOrder = async (req, res) => {

    const { userId, total } = req.body;

    const newOrder = await prisma.order.create({
        data: {
            userId,
            total
        }
    });

    res.status(201).json(newOrder);

};

module.exports = {
    getOrders,
    createOrder
};