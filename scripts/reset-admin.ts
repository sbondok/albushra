
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // Ensure Role Exists
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', permissions: JSON.stringify(['*']) }
  });

  // Upsert User
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      passwordHash: hashedPassword,
      isActive: true,
      roleId: adminRole.id
    },
    create: {
      username: 'admin',
      passwordHash: hashedPassword,
      email: 'admin@school.com',
      roleId: adminRole.id,
      isActive: true
    }
  });

  console.log('✅ Admin password forcefully reset to: admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
