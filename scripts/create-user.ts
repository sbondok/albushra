
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: npx tsx scripts/create-user.ts <username> <password> <role>');
    console.log('Roles: ADMIN, VIEWER');
    process.exit(1);
  }

  const [username, password, roleName] = args;
  const validRoles = ['ADMIN', 'VIEWER'];

  if (!validRoles.includes(roleName.toUpperCase())) {
    console.error(`❌ Invalid role. Choose from: ${validRoles.join(', ')}`);
    process.exit(1);
  }

  // Find Role
  const role = await prisma.role.findUnique({
    where: { name: roleName.toUpperCase() }
  });

  if (!role) {
    console.error(`❌ Role ${roleName} not found in database manually.`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash: hashedPassword,
        email: `${username}@albushra.edu.sa`, // Placeholder email
        roleId: role.id,
        isActive: true,
      }
    });
    console.log(`✅ User created successfully: ${user.username} (${role.name})`);
  } catch (error) {
    console.error('❌ Failed to create user (username might be taken):', error);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
