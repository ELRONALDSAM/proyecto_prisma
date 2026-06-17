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

router.get('/', getUsers);

router.get('/:id', getUserById);

router.post('/', (req, res) => {

    const { error } = validateUser(req.body);

    if (error) {
        return res.status(400).json({
            error
        });
    }

    createUser(req, res);

});

router.put('/:id', (req, res) => {

    const { error } = validateUser(req.body);

    if (error) {
        return res.status(400).json({
            error
        });
    }

    updateUser(req, res);

});

router.post('/login', loginUser);

router.put('/:id/address', updateAddress);

router.delete('/:id', deleteUser);

module.exports = router;