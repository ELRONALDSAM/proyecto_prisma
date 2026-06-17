const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const getAllUsers = async () => {

    return await prisma.user.findMany({
        select: {
            id: true,
            nombre: true,
            email: true,
            role: true
        }
    });

};

const getUserById = async (id) => {

    return await prisma.user.findUnique({
        where: {
            id
        }
    });

};

const getUserByEmail = async (email) => {

    return await prisma.user.findUnique({
        where: {
            email
        }
    });

};

const createUser = async (nombre, email, password) => {

    const hashedPassword = await bcrypt.hash(
        password,
        10
    );

    return await prisma.user.create({
        data: {
            nombre,
            email,
            password: hashedPassword
        }
    });

};

const updateUser = async (id, data) => {

    return await prisma.user.update({
        where: {
            id
        },
        data
    });

};

const deleteUser = async (id) => {

    return await prisma.user.delete({
        where: {
            id
        }
    });

};

module.exports = {
    getAllUsers,
    getUserById,
    getUserByEmail,
    createUser,
    updateUser,
    deleteUser
};