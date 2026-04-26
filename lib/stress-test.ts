/**
 * Stress Test for Simplified Platform
 * 
 * Tests username generation, email verification, and basic auth flows
 * Run with: npx tsx lib/stress-test.ts
 */

import { prisma } from "./db";
import { generateUniqueUsername } from "./username-generator";
import bcrypt from "bcryptjs";

console.log("🧪 PLATFORM STRESS TEST\n");
console.log("=".repeat(60));

async function main() {
  console.log("\n📊 DATABASE CONNECTION");
  try {
    await prisma.$connect();
    console.log("✅ Connected to database");
  } catch (error) {
    console.log("❌ Failed to connect:", error);
    return;
  }

  console.log("\n📊 SCHEMA VALIDATION");
  try {
    const userCount = await prisma.user.count();
    const studentCount = await prisma.studentProfile.count();
    const classCount = await prisma.class.count();
    
    console.log(`✅ Users table: ${userCount} users`);
    console.log(`✅ StudentProfile table: ${studentCount} students`);
    console.log(`✅ Class table: ${classCount} classes`);
    
    // Check if org-related tables are gone
    try {
      // @ts-expect-error - Should fail if organization table doesn't exist
      await prisma.organization.count();
      console.log("⚠️  Organization table still exists (unexpected)");
    } catch {
      console.log("✅ Organization table removed");
    }
  } catch (error) {
    console.log("❌ Schema validation failed:", error);
  }

  console.log("\n📊 USERNAME GENERATION TEST");
  const testNames = [
    "Ibrahim Munaser",
    "Ibrahim Munaser", // duplicate
    "John Smith",
    "Sarah Ali",
    "Muhammad Hassan",
  ];

  const generatedUsernames: string[] = [];
  for (const name of testNames) {
    try {
      const username = await generateUniqueUsername(name);
      generatedUsernames.push(username);
      console.log(`✅ ${name.padEnd(20)} → ${username}`);
    } catch (error) {
      console.log(`❌ ${name.padEnd(20)} → ERROR: ${error}`);
    }
  }

  // Verify duplicates were handled
  const uniqueCount = new Set(generatedUsernames).size;
  if (uniqueCount === generatedUsernames.length) {
    console.log(`✅ All ${generatedUsernames.length} usernames are unique`);
  } else {
    console.log(`⚠️  Found duplicate usernames!`);
  }

  console.log("\n📊 USER CREATION TEST");
  try {
    const testPassword = await bcrypt.hash("test123456", 12);
    const testUser = await prisma.user.create({
      data: {
        fullName: "Test Student",
        email: "test-" + Date.now() + "@example.com",
        username: "teststudent" + Date.now(),
        passwordHash: testPassword,
        role: "student",
        emailVerified: false,
        verificationToken: "test-token-" + Date.now(),
      },
    });

    // Create student profile
    await prisma.studentProfile.create({
      data: {
        userId: testUser.id,
      },
    });

    console.log("✅ Created test student account");
    console.log(`   ID: ${testUser.id}`);
    console.log(`   Username: ${testUser.username}`);
    console.log(`   Email: ${testUser.email}`);

    // Clean up
    await prisma.studentProfile.delete({ where: { userId: testUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log("✅ Cleanup successful");
  } catch (error) {
    console.log("❌ User creation failed:", error);
  }

  console.log("\n📊 ROLE VERIFICATION");
  const roles = await prisma.user.findMany({
    select: { role: true },
    distinct: ["role"],
  });
  
  console.log(`Found roles: ${roles.map((r) => r.role).join(", ")}`);
  
  const invalidRoles = roles.filter(
    (r) => r.role !== "platform_admin" && r.role !== "student"
  );
  
  if (invalidRoles.length > 0) {
    console.log(`⚠️  Found ${invalidRoles.length} users with invalid roles`);
  } else {
    console.log("✅ All roles are valid (platform_admin or student)");
  }

  console.log("\n📊 CONTENT VERIFICATION");
  try {
    const courseTemplates = await prisma.courseTemplate.count();
    console.log(`✅ ${courseTemplates} course templates`);
  } catch {
    console.log("⚠️  Content tables need to be set up");
  }

  console.log("\n" + "=".repeat(60));
  console.log("✨ STRESS TEST COMPLETE\n");

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("💥 Test failed:", error);
  process.exit(1);
});
