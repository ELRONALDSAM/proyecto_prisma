require('dotenv').config();

const express = require('express');
const path    = require('path');


const loggerMiddleware  = require('./middlewares/logger');
const errorHandle       = require('./middlewares/errorHandle');
const userRoutes        = require('./routes/userRoutes');
const productRoutes     = require('./routes/productRoutes');
const favoriteRoutes    = require('./routes/favoriteRoutes');
const cartRoutes        = require('./routes/cartRoutes');
const orderRoutes       = require('./routes/orderRoutes');
const categoryRoutes    = require('./routes/categoryRoutes');
const authenticateToken = require('./middlewares/auth');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(loggerMiddleware);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/users',      userRoutes);
app.use('/products',   productRoutes);
app.use('/favorites',  favoriteRoutes);
app.use('/cart',       cartRoutes);
app.use('/orders',     orderRoutes);
app.use('/categories', categoryRoutes);



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'vistas', 'index.html'));
});

app.get('/profile', authenticateToken, (req, res) => {
    res.json({
        message: 'Acceso permitido',
        user: req.user
    });
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'vistas', 'login.html'));
});

app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, 'vistas', 'registro.html'));
});

app.get('/productos', (req, res) => {
    res.sendFile(path.join(__dirname, 'vistas', 'productos.html'));
});

app.get('/carrito', (req, res) => {
    res.sendFile(path.join(__dirname, 'vistas', 'carrito.html'));
});

app.get('/contacto', (req, res) => {
    res.sendFile(path.join(__dirname, 'vistas', 'contacto.html'));
});

app.get('/error', (req, res, next) => {
    next(new Error('Error intencional'));
});

app.use(errorHandle);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'Vistas', 'admin.html'));
});