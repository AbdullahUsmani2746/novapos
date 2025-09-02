const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      id: "SALES",
      name: "Sales User",
      email: "sale@demo.com",
      password: "admin123",
      role: "SALES",
    },
     {
      id: "SALES_2",
      name: "Sales User",
      email: "sale_2@demo.com",
      password: "admin123",
      role: "SALES",
    },
     {
      id: "SALES_3",
      name: "Sales User",
      email: "sale_3demo.com",
      password: "admin123",
      role: "SALES",
    },
    
  ];

  for (const user of users) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });

    if (!existing) {
      await prisma.user.create({
        data: {
          id: user.id,
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
