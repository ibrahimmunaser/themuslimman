import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function removeAllStudents() {
  console.log("🗑️  Removing all students from database...\n");

  // Get count before deletion
  const studentCount = await prisma.user.count({
    where: { role: "student" }
  });

  console.log(`Found ${studentCount} students to remove\n`);

  if (studentCount === 0) {
    console.log("✓ No students to remove\n");
    return;
  }

  // Delete in order to respect foreign key constraints
  console.log("  • Deleting student progress...");
  const progressDeleted = await prisma.studentProgress.deleteMany();
  console.log(`    ✓ Deleted ${progressDeleted.count} progress records`);

  console.log("  • Deleting quiz attempts...");
  const quizDeleted = await prisma.quizAttempt.deleteMany();
  console.log(`    ✓ Deleted ${quizDeleted.count} quiz attempts`);

  console.log("  • Deleting exam attempts...");
  const examDeleted = await prisma.examAttempt.deleteMany();
  console.log(`    ✓ Deleted ${examDeleted.count} exam attempts`);

  console.log("  • Deleting class enrollments...");
  const enrollmentDeleted = await prisma.classEnrollment.deleteMany();
  console.log(`    ✓ Deleted ${enrollmentDeleted.count} enrollments`);

  console.log("  • Deleting student release overrides...");
  const overrideDeleted = await prisma.studentReleaseOverride.deleteMany();
  console.log(`    ✓ Deleted ${overrideDeleted.count} release overrides`);

  console.log("  • Deleting student profiles...");
  const profileDeleted = await prisma.studentProfile.deleteMany();
  console.log(`    ✓ Deleted ${profileDeleted.count} student profiles`);

  console.log("  • Deleting student user accounts...");
  const userDeleted = await prisma.user.deleteMany({
    where: { role: "student" }
  });
  console.log(`    ✓ Deleted ${userDeleted.count} user accounts`);

  console.log("\n✅ All students removed successfully!\n");
}

removeAllStudents()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
