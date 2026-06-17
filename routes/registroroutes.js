const express = require('express');
const path    = require('path');
const router  = express.Router();

const {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    loginUser
} = require('../controllers/userController');

const validateUser = require('../validators/userValidator');

/* ── CRUD ── */
router.get('/',     getUsers);
router.get('/:id',  getUserById);
router.delete('/:id', deleteUser);

/* ── Registro ── */
router.post('/', (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).json({ error });
    createUser(req, res);
});

/* ── Actualizar ── */
router.put('/:id', (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).json({ error });
    updateUser(req, res);
});

/* ── Login ── */
router.post('/login', loginUser);

module.exports = router;