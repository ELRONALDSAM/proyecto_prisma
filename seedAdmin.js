const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Iniciando seed de usuario administrador...');
  const adminEmail = 'admin'; // Compatible con el formato actual 'admin' / 'admin123'
  const hashedPassword = await bcrypt.hash('Admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      nombre: 'Admin Prisma',
      password: hashedPassword,
      role: 'ADMIN'
    },
    create: {
      nombre: 'Admin Prisma',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  console.log(`Usuario administrador creado/actualizado: ${adminUser.nombre} (${adminUser.email})`);
  console.log('Seed de administrador finalizado con éxito.');
}

main()
  .catch(e => {
    console.error('Error durante el seed de admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
