const userService = require('../services/userService');
const jwt         = require('jsonwebtoken');
const bcrypt      = require('bcryptjs');

/* ── Obtener todos los usuarios ── */
const getUsers = async (req, res) => {
    const users = await userService.getAllUsers();
    res.json(users);
};

/* ── Obtener usuario por ID ── */
const getUserById = async (req, res) => {
    const userId = parseInt(req.params.id);
    const user   = await userService.getUserById(userId);

    if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
};

/* ── Registrar nuevo usuario ── */
const createUser = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Verificar si el email ya existe
        const existing = await userService.getUserByEmail(email);
        if (existing) {
            return res.status(409).json({ error: 'El correo ya está registrado.' });
        }

        const newUser = await userService.createUser(nombre, email, password);

        // No devolver la contraseña
        const { password: _, ...safeUser } = newUser;
        res.status(201).json(safeUser);

    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(400).json({ error: 'Error al crear el usuario.' });
    }
};

/* ── Actualizar usuario ── */
const updateUser = async (req, res) => {
    const userId     = parseInt(req.params.id);
    const updatedUser = await userService.updateUser(userId, req.body);
    res.json(updatedUser);
};

/* ── Eliminar usuario ── */
const deleteUser = async (req, res) => {
    const userId = parseInt(req.params.id);
    await userService.deleteUser(userId);
    res.json({ message: 'Usuario eliminado' });
};

/* ── Login ── */
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await userService.getUserByEmail(email);

    if (!user) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, nombre: user.nombre },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({ token, nombre: user.nombre });
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    loginUser
};