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

    const mappedFavorites = favorites.map(fav => {
      if (!fav.product) return fav;
      return {
        ...fav,
        product: {
          id: fav.product.id,
          name: fav.product.nombre,
          price: fav.product.precio,
          category: fav.product.categoria || 'mujer',
          discount: fav.product.descuento || 0,
          status: fav.product.estado || 'activo',
          desc: fav.product.descripcion || '',
          img: fav.product.imagen || '',
          stock: fav.product.stock !== undefined && fav.product.stock !== null ? fav.product.stock : 10
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