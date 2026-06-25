const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const authenticateToken = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, '../public/imagen');
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'img-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer upload limits and validation
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp).'));
    }
  }
});

router.get('/', getProducts);
router.post('/', authenticateToken, adminMiddleware, createProduct);
router.put('/:id', authenticateToken, adminMiddleware, updateProduct);
router.delete('/:id', authenticateToken, adminMiddleware, deleteProduct);

// Image upload endpoint
router.post('/upload', authenticateToken, adminMiddleware, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo de imagen' });
    }
    const relativePath = `imagen/${req.file.filename}`;
    res.json({ url: relativePath });
  });
});

module.exports = router;