const prisma = require('./lib/prisma');

const SEED_PRODUCTS = [
  {
    id: 1,
    nombre: 'Vestido de Gala Seda',
    descripcion: 'Vestido de gala en seda natural, corte evasé, cierre lateral invisible. Tallas S–XL.',
    categoria: 'mujer',
    precio: 3679.15,
    precioAnterior: 3679.15,
    descuento: 0,
    imagen: 'imagen/vestido-gala-seda .png',
    estado: 'activo',
    stock: 10
  },
  {
    id: 2,
    nombre: 'Traje Lino Italiano',
    descripcion: 'Traje de lino italiano corte slim, forro de seda, botones nácar. Perfecto para el verano.',
    categoria: 'hombre',
    precio: 8800.00,
    precioAnterior: 8800.00,
    descuento: 0,
    imagen: 'imagen/traje_hombre.png',
    estado: 'activo',
    stock: 10
  },
  {
    id: 3,
    nombre: 'Conjunto Niño Premium',
    descripcion: 'Conjunto algodón orgánico, camisa + pantalón chino. Cómodo y elegante.',
    categoria: 'nino',
    precio: 3200.00,
    precioAnterior: 3200.00,
    descuento: 0,
    imagen: 'imagen/conjunto-niño.png',
    estado: 'activo',
    stock: 10
  },
  {
    id: 4,
    nombre: 'Falda Plisada Larga',
    descripcion: 'Falda plisada en gasa de poliéster reciclado. Fluida y versátil, día y noche.',
    categoria: 'mujer',
    precio: 2800.00,
    precioAnterior: 2800.00,
    descuento: 0,
    imagen: 'imagen/falda-elegante.png',
    estado: 'activo',
    stock: 10
  },
  {
    id: 5,
    nombre: 'Vestido Midi Floral',
    descripcion: 'Vestido midi floral, manga corta, escote redondo. Pieza imprescindible de la temporada.',
    categoria: 'mujer',
    precio: 2660.00,
    precioAnterior: 3800.00,
    descuento: 30,
    imagen: 'imagen/Vestido Midi Floral.png',
    estado: 'activo',
    stock: 10
  },
  {
    id: 6,
    nombre: 'Blusa de Seda Estampada',
    descripcion: 'Blusa en seda estampada, cierre de botones en la espalda. Fresca y sofisticada.',
    categoria: 'mujer',
    precio: 1875.00,
    precioAnterior: 2500.00,
    descuento: 25,
    imagen: 'imagen/blusa de seda.png',
    estado: 'activo',
    stock: 10
  },
  {
    id: 7,
    nombre: 'Accesorios Mujer',
    descripcion: 'Set: bolso clutch + collar artesanal. Complemento perfecto para cualquier outfit.',
    categoria: 'accesorios',
    precio: 1520.00,
    precioAnterior: 1900.00,
    descuento: 20,
    imagen: 'imagen/asesorios de mujer .png',
    estado: 'activo',
    stock: 10
  },
  {
    id: 8,
    nombre: 'Camisa Casual de Rayas',
    descripcion: 'Camisa de algodón con rayas verticales, corte regular, perfecta para el día a día.',
    categoria: 'hombre',
    precio: 1520.00,
    precioAnterior: 1900.00,
    descuento: 20,
    imagen: 'imagen/camisa-casual-hombre.png',
    estado: 'activo',
    stock: 10
  },
  {
    id: 9,
    nombre: 'Pantalón Chino Verde',
    descripcion: 'Pantalón chino en gabardina stretch, color verde salvia. Cómodo y elegante.',
    categoria: 'hombre',
    precio: 2040.00,
    precioAnterior: 2400.00,
    descuento: 15,
    imagen: 'imagen/pantalon-verde-hombres.png',
    estado: 'activo',
    stock: 10
  },
  {
    id: 10,
    nombre: 'Accesorios Hombre',
    descripcion: 'Kit: cinturón de cuero + pañuelo de bolsillo. Detalles que hacen la diferencia.',
    categoria: 'accesorios',
    precio: 715.00,
    precioAnterior: 1100.00,
    descuento: 35,
    imagen: 'imagen/accesorio de hombre.png',
    estado: 'activo',
    stock: 10
  },
  {
    id: 11,
    nombre: 'Camisa Casual Niño',
    descripcion: 'Camisa de algodón para niño, cómoda y fresca para el día a día.',
    categoria: 'nino',
    precio: 2660.00,
    precioAnterior: 3800.00,
    descuento: 30,
    imagen: 'imagen/camisa casual de niño.png',
    estado: 'activo',
    stock: 10
  },
  {
    id: 12,
    nombre: 'Short Casual Niño',
    descripcion: 'Short algodón jersey, elástico en cintura, bolsillos laterales. Perfecto para el juego.',
    categoria: 'nino',
    precio: 1875.00,
    precioAnterior: 2500.00,
    descuento: 25,
    imagen: 'imagen/short casual de niño .png',
    estado: 'activo',
    stock: 10
  },
  {
    id: 13,
    nombre: 'Accesorios Niño',
    descripcion: 'Set: mochila mini + gorra de temporada. Funcional y divertido.',
    categoria: 'accesorios',
    precio: 1520.00,
    precioAnterior: 1900.00,
    descuento: 20,
    imagen: 'imagen/accesorio de niño .png',
    estado: 'activo',
    stock: 10
  }
];

async function main() {
  console.log('Iniciando seed de productos detallados...');
  for (const prod of SEED_PRODUCTS) {
    const upserted = await prisma.product.upsert({
      where: { id: prod.id },
      update: {
        nombre: prod.nombre,
        descripcion: prod.descripcion,
        categoria: prod.categoria,
        precio: prod.precio,
        precioAnterior: prod.precioAnterior,
        descuento: prod.descuento,
        imagen: prod.imagen,
        estado: prod.estado,
        stock: prod.stock
      },
      create: {
        id: prod.id,
        nombre: prod.nombre,
        descripcion: prod.descripcion,
        categoria: prod.categoria,
        precio: prod.precio,
        precioAnterior: prod.precioAnterior,
        descuento: prod.descuento,
        imagen: prod.imagen,
        estado: prod.estado,
        stock: prod.stock
      }
    });
    console.log(`Producto ${upserted.id} guardado: ${upserted.nombre}`);
  }

  // Reset sequence in PostgreSQL to avoid serial key conflicts
  try {
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Product"', 'id'), coalesce(max(id)+1, 1), false) FROM "Product";`;
    console.log('Secuencia de Product reiniciada con éxito.');
  } catch (err) {
    console.log('No se pudo reiniciar la secuencia de Product:', err.message);
  }

  console.log('Seed finalizado con éxito.');
}

main()
  .catch(e => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
