const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      name: "Admin User",
      email: "admin@demo.com",
      password: "admin123",
      role: "ADMIN",
    },
    {
      name: "Cashier User",
      email: "cashier@demo.com",
      password: "cashier123",
      role: "CASHIER",
    },
    {
      name: "Accountant User",
      email: "accountant@demo.com",
      password: "accountant123",
      role: "ACCOUNTANT",
    },
  ];

  for (const user of users) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });

    if (!existing) {
      await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: true,
          password: await bcrypt.hash(user.password, 10),
        },
      });
      console.log(`✅ Created user: ${user.email}`);
    } else {
      console.log(`⚠️ User already exists: ${user.email}`);
    }
  }
}

main()
  .then(() => {
    console.log("🌱 Seeding complete");
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
