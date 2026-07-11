// backend/prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_SUPER_ADMIN_EMAIL ?? 'admin@elorgeschools.com';
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD ?? 'Admin1234!';
  const fullName = process.env.SEED_SUPER_ADMIN_NAME ?? 'Platform Super Admin';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`SUPER_ADMIN already exists (${email}) — skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      role: Role.SUPER_ADMIN,
      schoolId: null,
    },
  });

  console.log('Created SUPER_ADMIN:');
  console.log(`  email:    ${user.email}`);
  console.log(`  password: ${password}  (change this after first login)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });