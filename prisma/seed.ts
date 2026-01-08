
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      permissions: JSON.stringify(['*']), // Full access
    },
  });

  const viewerRole = await prisma.role.upsert({
    where: { name: 'VIEWER' },
    update: {},
    create: {
      name: 'VIEWER',
      permissions: JSON.stringify(['read:invoices', 'read:reports']), // Read only
    },
  });

  console.log('✅ Roles created/verified: ADMIN, VIEWER');

  // 2. Create Default Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {}, // Don't overwrite if exists
    create: {
      username: 'admin',
      email: 'admin@albushra.edu.sa',
      passwordHash: hashedPassword,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  console.log(`✅ Admin user ready: ${adminUser.username} / admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
