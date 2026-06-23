const prisma = require('../lib/prisma');

const SEED_PRODUCTS = [
  {id:1,name:'Vestido de Gala Seda',category:'mujer',price:3679.15,discount:0,status:'activo',img:'imagen/vestido-gala-seda .png',desc:'Seda natural. S–XL.'},
  {id:2,name:'Traje Lino Italiano',category:'hombre',price:8800,discount:0,status:'activo',img:'imagen/traje_hombre.png',desc:'Corte slim.'},
  {id:3,name:'Conjunto Niño Premium',category:'nino',price:3200,discount:0,status:'activo',img:'imagen/conjunto-niño.png',desc:'Algodón orgánico.'},
  {id:4,name:'Falda Plisada Larga',category:'mujer',price:2800,discount:0,status:'activo',img:'imagen/falda-elegante.png',desc:'Gasa de poliéster.'},
  {id:5,name:'Vestido Midi Floral',category:'mujer',price:2660,discount:30,status:'activo',img:'imagen/Vestido Midi Floral.png',desc:'Manga corta.'},
  {id:6,name:'Blusa de Seda Estampada',category:'mujer',price:1875,discount:25,status:'activo',img:'imagen/blusa de seda.png',desc:'Cierre espalda.'},
  {id:7,name:'Accesorios Mujer',category:'accesorios',price:1520,discount:20,status:'activo',img:'imagen/asesorios de mujer .png',desc:'Bolso + collar.'},
  {id:8,name:'Camisa Casual de Rayas',category:'hombre',price:1520,discount:20,status:'activo',img:'imagen/camisa-casual-hombre.png',desc:'Rayas verticales.'},
  {id:9,name:'Pantalón Chino Verde',category:'hombre',price:2040,discount:15,status:'activo',img:'imagen/pantalon-verde-hombres.png',desc:'Color salvia.'},
  {id:10,name:'Accesorios Hombre',category:'accesorios',price:715,discount:35,status:'activo',img:'imagen/accesorio de hombre.png',desc:'Cinturón + pañuelo.'},
  {id:11,name:'Camisa Casual Niño',category:'nino',price:2660,discount:30,status:'activo',img:'imagen/camisa casual de niño.png',desc:'Algodón cómoda.'},
  {id:12,name:'Short Casual Niño',category:'nino',price:1875,discount:25,status:'activo',img:'imagen/short casual de niño .png',desc:'Bolsillos laterales.'},
  {id:13,name:'Accesorios Niño',category:'accesorios',price:1520,discount:20,status:'activo',img:'imagen/accesorio de niño .png',desc:'Mochila + gorra.'}
];

// Helper to map DB Product to frontend fields
const mapDbProductToFrontend = (dbProduct) => {
  if (!dbProduct) return null;
  const seed = SEED_PRODUCTS.find(p => p.id === dbProduct.id) || {};
  return {
    id: dbProduct.id,
    name: dbProduct.nombre,
    price: dbProduct.precio,
    category: seed.category || 'mujer',
    discount: seed.discount || 0,
    status: seed.status || 'activo',
    desc: seed.desc || '',
    img: seed.img || '',
    stock: dbProduct.stock
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
  const newProduct = await prisma.product.create({
    data: {
      nombre: data.name,
      precio: parseFloat(data.price),
      stock: data.stock !== undefined ? parseInt(data.stock) : 10
    }
  });
  return mapDbProductToFrontend(newProduct);
};

const updateProduct = async (id, data) => {
  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      nombre: data.name,
      precio: data.price !== undefined ? parseFloat(data.price) : undefined,
      stock: data.stock !== undefined ? parseInt(data.stock) : undefined
    }
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