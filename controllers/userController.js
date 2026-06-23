const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper to remove password field from user objects
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

const getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.json(sanitizeUser(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: 'Nombre, email y password son requeridos'
      });
    }

    const existingUser = await userService.getUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        error: 'El email ya está registrado'
      });
    }

    const newUser = await userService.createUser(
      nombre,
      email,
      password
    );

    res.status(201).json(sanitizeUser(newUser));
  } catch (error) {
    console.error("ERROR CREATE USER:", error);
    res.status(500).json({
      error: error.message
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const updatedUser = await userService.updateUser(
      userId,
      req.body
    );

    res.json(sanitizeUser(updatedUser));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    await userService.deleteUser(userId);

    res.json({
      message: 'Usuario eliminado'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userService.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        error: 'Email o contraseña incorrectos'
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        error: 'Email o contraseña incorrectos'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h'
      }
    );

    res.json({
      token,
      id: user.id,
      nombre: user.nombre,
      role: user.role
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const {
      telefono,
      direccion,
      ciudad,
      departamento,
      notas
    } = req.body;

    const updatedUser = await userService.updateUser(
      userId,
      {
        telefono,
        direccion,
        ciudad,
        departamento,
        notas
      }
    );

    res.json(sanitizeUser(updatedUser));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  updateAddress
};
