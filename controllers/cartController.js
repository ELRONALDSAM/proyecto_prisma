const prisma = require('../lib/prisma');

const getCart = async (req, res) => {
  try {
    const { userId } = req.query;
    const where = {};
    if (userId) {
      const parsedUserId = parseInt(userId);
      if (!isNaN(parsedUserId)) {
        where.userId = parsedUserId;
      }
    }
    const cart = await prisma.cart.findMany({
      where,
      orderBy: {
        id: 'asc'
      }
    });
    res.json(cart);
  } catch (error) {
    console.error('ERROR GET CART:', error);
    res.status(500).json({
      error: error.message
    });
  }
};

const createCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const parsedUserId = parseInt(userId);
    const parsedProductId = parseInt(productId);
    const parsedQuantity = quantity !== undefined ? parseInt(quantity) : 1;

    console.log('datos recibidos por el backend:', req.body);
    console.log(`[createCart] Procesando: userId=${parsedUserId}, productId=${parsedProductId}, quantity=${parsedQuantity}`);

    if (isNaN(parsedUserId) || isNaN(parsedProductId)) {
      return res.status(400).json({ error: 'userId y productId deben ser números válidos' });
    }

    // Validar existencia de usuario y producto en base de datos
    const userExists = await prisma.user.findUnique({ where: { id: parsedUserId } });
    if (!userExists) {
      return res.status(404).json({ error: `El usuario con ID ${parsedUserId} no existe` });
    }
    const productExists = await prisma.product.findUnique({ where: { id: parsedProductId } });
    if (!productExists) {
      return res.status(404).json({ error: `El producto con ID ${parsedProductId} no existe` });
    }

    // Buscar si ya existe el producto en el carrito de este usuario
    const existingCartItem = await prisma.cart.findFirst({
      where: {
        userId: parsedUserId,
        productId: parsedProductId
      }
    });

    let cartItem;
    if (existingCartItem) {
      cartItem = await prisma.cart.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + parsedQuantity
        }
      });
      console.log('respuesta de Prisma (CARRITO ACTUALIZADO):', cartItem);
    } else {
      cartItem = await prisma.cart.create({
        data: {
          userId: parsedUserId,
          productId: parsedProductId,
          quantity: parsedQuantity
        }
      });
      console.log('respuesta de Prisma (CARRITO CREADO):', cartItem);
    }

    res.status(201).json(cartItem);
  } catch (error) {
    console.error('ERROR CREATE CART:', error);
    res.status(500).json({
      error: error.message
    });
  }
};

const deleteCart = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de carrito inválido' });
    }
    console.log('INTENTANDO ELIMINAR CARRITO CON ID:', id);
    const cart = await prisma.cart.delete({
      where: { id }
    });
    console.log('CARRITO ELIMINADO EXITOSAMENTE:', cart);
    res.json({ message: 'Item eliminado del carrito', cart });
  } catch (error) {
    console.error('ERROR DELETE CART:', error);
    res.status(500).json({
      error: error.message
    });
  }
};

const deleteUserCart = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId es requerido para vaciar el carrito' });
    }
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({ error: 'userId debe ser un número válido' });
    }
    console.log(`VACIANDO CARRITO EN LA DB PARA USUARIO ID: ${parsedUserId}`);
    const deleted = await prisma.cart.deleteMany({
      where: { userId: parsedUserId }
    });
    console.log('RESULTADO DE VACÍAR CARRITO EN DB:', deleted);
    res.json({ message: 'Carrito vaciado con éxito', count: deleted.count });
  } catch (error) {
    console.error('ERROR VACÍAR CARRITO:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCart,
  createCart,
  deleteCart,
  deleteUserCart
};