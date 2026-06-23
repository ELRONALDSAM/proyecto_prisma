const productService = require('../services/productService');

const getProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('ERROR GET PRODUCTS:', error);
    res.status(500).json({ error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const newProduct = await productService.createProduct(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('ERROR CREATE PRODUCT:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updatedProduct = await productService.updateProduct(id, req.body);
    res.json(updatedProduct);
  } catch (error) {
    console.error('ERROR UPDATE PRODUCT:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await productService.deleteProduct(id);
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error('ERROR DELETE PRODUCT:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};