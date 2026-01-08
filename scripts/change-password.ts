
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: npx tsx scripts/change-password.ts <username> <new-password>');
    process.exit(1);
  }

  const [username, newPassword] = args;

  const user = await prisma.user.findUnique({
    where: { username }
  });

  if (!user) {
    console.error(`❌ User "${username}" not found.`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashedPassword }
  });

  console.log(`✅ Password updated successfully for user: ${username}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
