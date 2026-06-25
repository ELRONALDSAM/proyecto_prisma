const express = require('express');

const router = express.Router();

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  updateAddress
} = require('../controllers/userController');

const validateUser = require('../validators/userValidator');
const authenticateToken = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.get('/', authenticateToken, adminMiddleware, getUsers);

router.get('/:id', authenticateToken, getUserById);

router.post('/', (req, res) => {

    const { error } = validateUser(req.body);

    if (error) {
        return res.status(400).json({
            error
        });
    }

    createUser(req, res);

});

router.put('/:id', authenticateToken, (req, res) => {

    const { error } = validateUser(req.body);

    if (error) {
        return res.status(400).json({
            error
        });
    }

    updateUser(req, res);

});

router.post('/login', loginUser);

router.put('/:id/address', authenticateToken, updateAddress);

router.delete('/:id', authenticateToken, adminMiddleware, deleteUser);

module.exports = router;