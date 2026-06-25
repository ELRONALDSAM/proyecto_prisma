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
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.sendFile(path.join(__dirname, 'Vistas', 'index.html'));
});

app.get('/profile', authenticateToken, (req, res) => {
    res.json({
        message: 'Acceso permitido',
        user: req.user
    });
});

app.get('/error', (req, res, next) => {
    next(new Error('Error intencional'));
});

app.get('/admin', (req, res) => {
    let token = null;
    
    if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(';').reduce((acc, c) => {
            const [k, ...v] = c.split('=');
            if (k && v) {
                acc[k.trim()] = v.join('=').trim();
            }
            return acc;
        }, {});
        token = cookies['token'];
    }
    
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token && req.query.token) {
        token = req.query.token;
    }
    
    if (!token) {
        return res.status(403).send('Acceso denegado. Se requiere autenticación.');
    }
    
    const jwt = require('jsonwebtoken');
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
        if (err || !decodedUser || decodedUser.role !== 'ADMIN') {
            return res.status(403).send('Acceso denegado. Se requiere rol de administrador.');
        }
        res.sendFile(path.join(__dirname, 'Vistas', 'admin.html'));
    });
});

app.use(errorHandle);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});