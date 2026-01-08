
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { username: 'admin' },
    include: { role: true }
  });

  if (!user) {
    console.log('❌ User "admin" NOT FOUND in database.');
    return;
  }

  console.log('✅ User found:', {
    id: user.id,
    username: user.username,
    role: user.role.name,
    isActive: user.isActive,
    passwordHash: user.passwordHash.substring(0, 10) + '...'
  });

  // Test password
  const isValid = await bcrypt.compare('admin123', user.passwordHash);
  console.log(`🔐 Password 'admin123' valid? ${isValid}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
