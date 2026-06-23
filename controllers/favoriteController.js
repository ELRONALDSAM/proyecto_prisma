const prisma = require('../lib/prisma');

const getFavorites = async (req, res) => {
  try {
    const { userId } = req.query;
    const where = {};
    if (userId) {
      const parsedUserId = parseInt(userId);
      if (!isNaN(parsedUserId)) {
        where.userId = parsedUserId;
      }
    }

    const favorites = await prisma.favorite.findMany({
      where,
      include: {
        product: true
      }
    });

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

    const mappedFavorites = favorites.map(fav => {
      if (!fav.product) return fav;
      const seed = SEED_PRODUCTS.find(p => p.id === fav.product.id) || {};
      return {
        ...fav,
        product: {
          id: fav.product.id,
          name: fav.product.nombre,
          price: fav.product.precio,
          category: seed.category || 'mujer',
          discount: seed.discount || 0,
          status: seed.status || 'activo',
          desc: seed.desc || '',
          img: seed.img || '',
          stock: fav.product.stock
        }
      };
    });

    res.json(mappedFavorites);
  } catch (error) {
    console.error('ERROR GET FAVORITES:', error);
    res.status(500).json({
      error: error.message
    });
  }
};

const createFavorite = async (req, res) => {
  try {
    console.log('BODY RECIBIDO CREATE FAVORITE:', req.body);
    const { userId, productId } = req.body;
    console.log(`productId recibido en el backend: ${productId}`);

    if (!userId || !productId) {
      return res.status(400).json({ error: 'userId y productId son requeridos' });
    }

    const parsedUserId = parseInt(userId);
    const parsedProductId = parseInt(productId);

    if (isNaN(parsedUserId) || isNaN(parsedProductId)) {
      return res.status(400).json({ error: 'userId y productId deben ser números válidos' });
    }

    // Validar existencia de usuario y producto en la base de datos
    const userExists = await prisma.user.findUnique({
      where: { id: parsedUserId }
    });
    if (!userExists) {
      console.warn(`Intento de guardar favorito para un usuario inexistente ID: ${parsedUserId}`);
      return res.status(404).json({ error: `El usuario con ID ${parsedUserId} no existe` });
    }

    const productExists = await prisma.product.findUnique({
      where: { id: parsedProductId }
    });
    if (!productExists) {
      console.warn(`Intento de guardar favorito para un producto inexistente ID: ${parsedProductId}`);
      return res.status(404).json({ error: `El producto con ID ${parsedProductId} no existe` });
    }

    // Evitar duplicados
    const existing = await prisma.favorite.findFirst({
      where: {
        userId: parsedUserId,
        productId: parsedProductId
      }
    });

    if (existing) {
      console.log('El favorito ya existe:', existing);
      return res.status(200).json(existing);
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: parsedUserId,
        productId: parsedProductId
      }
    });

    console.log('favorite creado en Prisma:', favorite);
    console.log('FAVORITO GUARDADO EXITOSAMENTE:', favorite);
    res.status(201).json(favorite);
  } catch (error) {
    console.error('ERROR CREATE FAVORITE:', error);
    res.status(500).json({
      error: error.message
    });
  }
};

const deleteFavorite = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de favorito inválido' });
    }

    console.log('INTENTANDO ELIMINAR FAVORITO CON ID:', id);

    const favorite = await prisma.favorite.delete({
      where: {
        id: id
      }
    });

    console.log('FAVORITO ELIMINADO EXITOSAMENTE:', favorite);
    res.json({ message: 'Favorito eliminado exitosamente', favorite });
  } catch (error) {
    console.error('ERROR DELETE FAVORITE:', error);
    res.status(500).json({
      error: error.message
    });
  }
};

module.exports = {
  getFavorites,
  createFavorite,
  deleteFavorite
};