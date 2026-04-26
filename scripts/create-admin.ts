import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdmin() {
  const username = "themuslimman_admin";
  const password = "Chemithabet22?";
  const email = "themuslimman77@gmail.com"; // Using the email from .env
  const fullName = "TheMuslimMan Admin";

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { username },
  });

  if (existing) {
    console.log("✅ Admin user already exists!");
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${existing.email}`);
    console.log(`   Role: ${existing.role}`);
    return;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create admin user
  const user = await prisma.user.create({
    data: {
      username,
      email,
      fullName,
      passwordHash,
      role: "platform_admin",
      isActive: true,
      emailVerified: true, // Set to true so they can log in immediately
    },
  });

  console.log("✅ Admin user created successfully!");
  console.log(`   Username: ${username}`);
  console.log(`   Password: ${password}`);
  console.log(`   Email: ${email}`);
  console.log(`   Role: ${user.role}`);
  console.log("\n🔐 You can now log in at http://localhost:3000/login");
}

createAdmin()
  .catch((error) => {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
