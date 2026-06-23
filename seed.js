const prisma = require('./lib/prisma');

const SEED_PRODUCTS = [
  {id:1,nombre:'Vestido de Gala Seda',precio:3679.15,stock:10},
  {id:2,nombre:'Traje Lino Italiano',precio:8800.00,stock:10},
  {id:3,nombre:'Conjunto Niño Premium',precio:3200.00,stock:10},
  {id:4,nombre:'Falda Plisada Larga',precio:2800.00,stock:10},
  {id:5,nombre:'Vestido Midi Floral',precio:2660.00,stock:10},
  {id:6,nombre:'Blusa de Seda Estampada',precio:1875.00,stock:10},
  {id:7,nombre:'Accesorios Mujer',precio:1520.00,stock:10},
  {id:8,nombre:'Camisa Casual de Rayas',precio:1520.00,stock:10},
  {id:9,nombre:'Pantalón Chino Verde',precio:2040.00,stock:10},
  {id:10,nombre:'Accesorios Hombre',precio:715.00,stock:10},
  {id:11,nombre:'Camisa Casual Niño',precio:2660.00,stock:10},
  {id:12,nombre:'Short Casual Niño',precio:1875.00,stock:10},
  {id:13,nombre:'Accesorios Niño',precio:1520.00,stock:10}
];

async function main() {
  console.log('Iniciando seed de productos...');
  for (const prod of SEED_PRODUCTS) {
    const upserted = await prisma.product.upsert({
      where: { id: prod.id },
      update: {
        nombre: prod.nombre,
        precio: prod.precio,
        stock: prod.stock
      },
      create: {
        id: prod.id,
        nombre: prod.nombre,
        precio: prod.precio,
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
