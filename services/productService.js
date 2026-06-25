const prisma = require('../lib/prisma');

// Helper to map DB Product to frontend fields
const mapDbProductToFrontend = (dbProduct) => {
  if (!dbProduct) return null;
  return {
    id: dbProduct.id,
    name: dbProduct.nombre,
    price: dbProduct.precio,
    precioAnterior: dbProduct.precioAnterior || dbProduct.precio,
    category: dbProduct.categoria || 'mujer',
    discount: dbProduct.descuento || 0,
    status: dbProduct.estado || 'activo',
    desc: dbProduct.descripcion || '',
    img: dbProduct.imagen || '',
    stock: dbProduct.stock !== undefined ? dbProduct.stock : 10
  };
};

const getAllProducts = async () => {
  const products = await prisma.product.findMany();
  return products.map(mapDbProductToFrontend);
};

const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id }
  });
  return mapDbProductToFrontend(product);
};

const createProduct = async (data) => {
  const discountVal = data.discount !== undefined ? parseInt(data.discount) : 0;
  const priceVal = parseFloat(data.price);
  
  // Calculate priceAnterior based on price and discount if not provided
  const priceAnteriorVal = data.precioAnterior !== undefined 
    ? parseFloat(data.precioAnterior)
    : (discountVal > 0 ? priceVal / (1 - discountVal / 100) : priceVal);

  const newProduct = await prisma.product.create({
    data: {
      nombre: data.name,
      descripcion: data.desc || '',
      categoria: data.category || 'mujer',
      precio: priceVal,
      precioAnterior: priceAnteriorVal,
      descuento: discountVal,
      imagen: data.img || '',
      estado: data.status || 'activo',
      stock: data.stock !== undefined ? parseInt(data.stock) : 10
    }
  });
  return mapDbProductToFrontend(newProduct);
};

const updateProduct = async (id, data) => {
  const discountVal = data.discount !== undefined ? parseInt(data.discount) : undefined;
  const priceVal = data.price !== undefined ? parseFloat(data.price) : undefined;
  
  // Prepare database update object
  const updateData = {};
  if (data.name !== undefined) updateData.nombre = data.name;
  if (data.desc !== undefined) updateData.descripcion = data.desc;
  if (data.category !== undefined) updateData.categoria = data.category;
  if (priceVal !== undefined) updateData.precio = priceVal;
  if (discountVal !== undefined) updateData.descuento = discountVal;
  if (data.img !== undefined) updateData.imagen = data.img;
  if (data.status !== undefined) updateData.estado = data.status;
  if (data.stock !== undefined) updateData.stock = parseInt(data.stock);

  // Calculate or update precioAnterior if price or discount is changing
  if (priceVal !== undefined || discountVal !== undefined) {
    // We need current values to perform correct calculation if one is missing
    const current = await prisma.product.findUnique({ where: { id } });
    if (current) {
      const finalPrice = priceVal !== undefined ? priceVal : current.precio;
      const finalDiscount = discountVal !== undefined ? discountVal : current.descuento;
      updateData.precioAnterior = finalDiscount > 0 ? finalPrice / (1 - finalDiscount / 100) : finalPrice;
    }
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: updateData
  });
  return mapDbProductToFrontend(updatedProduct);
};

const deleteProduct = async (id) => {
  const deletedProduct = await prisma.product.delete({
    where: { id }
  });
  return mapDbProductToFrontend(deletedProduct);
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};