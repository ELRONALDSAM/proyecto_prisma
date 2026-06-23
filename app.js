require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const loggerMiddleware  = require('./middlewares/logger');
const errorHandle       = require('./middlewares/errorHandle');
const userRoutes        = require('./routes/userRoutes');
const productRoutes     = require('./routes/productRoutes');
const favoriteRoutes    = require('./routes/favoriteRoutes');
const cartRoutes        = require('./routes/cartRoutes');
const orderRoutes       = require('./routes/orderRoutes');
const categoryRoutes    = require('./routes/categoryRoutes');
const authenticateToken = require('./middlewares/auth');

app.use(loggerMiddleware);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/users',      userRoutes);
app.use('/products',   productRoutes);
app.use('/favorites',  favoriteRoutes);
app.use('/cart',       cartRoutes);
app.use('/orders',     orderRoutes);
app.use('/categories', categoryRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Vistas', 'index.html'));
});

app.get('/profile', authenticateToken, (req, res) => {
    res.json({
        message: 'Acceso permitido',
        user: req.user
    });
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'Vistas', 'login.html'));
});

app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, 'Vistas', 'registro.html'));
});

app.get('/productos', (req, res) => {
    res.sendFile(path.join(__dirname, 'Vistas', 'productos.html'));
});

app.get('/carrito', (req, res) => {
    res.sendFile(path.join(__dirname, 'Vistas', 'carrito.html'));
});

app.get('/contacto', (req, res) => {
    res.sendFile(path.join(__dirname, 'Vistas', 'contacto.html'));
});

app.get('/error', (req, res, next) => {
    next(new Error('Error intencional'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'Vistas', 'admin.html'));
});

app.use(errorHandle);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});