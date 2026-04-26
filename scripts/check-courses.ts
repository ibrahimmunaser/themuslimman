import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkCourses() {
  console.log("🔍 Checking course templates in database...\n");

  const allCourses = await prisma.courseTemplate.findMany({
    include: {
      _count: { select: { items: true, classCourses: true } },
    },
  });

  console.log(`Total course templates: ${allCourses.length}\n`);

  if (allCourses.length === 0) {
    console.log("❌ No course templates found in database!");
    console.log("\nYou need to create a course template for the Seerah course.");
  } else {
    console.log("Course templates found:\n");
    allCourses.forEach((course, idx) => {
      console.log(`${idx + 1}. ${course.title}`);
      console.log(`   ID: ${course.id}`);
      console.log(`   Active: ${course.isActive ? "✅ Yes" : "❌ No"}`);
      console.log(`   Items: ${course._count.items} lessons`);
      console.log(`   Used in: ${course._count.classCourses} programs`);
      console.log(`   Description: ${course.description || "(none)"}`);
      console.log("");
    });
  }

  // Check if there are Seerah parts
  const partCount = await prisma.seerahPart.count();
  console.log(`\n📚 Seerah parts in database: ${partCount}`);

  if (partCount > 0 && allCourses.length === 0) {
    console.log("\n💡 You have Seerah parts but no course template!");
    console.log("   Creating a course template now...\n");

    const newCourse = await prisma.courseTemplate.create({
      data: {
        title: "Full Seerah — All 100 Parts",
        description: "Complete biography of Prophet Muhammad ﷺ from birth to death, covering all major events, battles, and lessons.",
        isActive: true,
      },
    });

    console.log(`✅ Created course template: "${newCourse.title}"`);
    console.log(`   ID: ${newCourse.id}`);
    console.log(`   Active: ${newCourse.isActive}`);

    // Link all Seerah parts to this course
    const allParts = await prisma.seerahPart.findMany({
      orderBy: { partNumber: "asc" },
    });

    console.log(`\n📦 Linking ${allParts.length} parts to course...`);

    for (const part of allParts) {
      await prisma.courseTemplateItem.create({
        data: {
          courseTemplateId: newCourse.id,
          seerahPartId: part.id,
          itemOrder: part.partNumber,
          isRequired: true,
        },
      });
    }

    console.log(`✅ Linked all ${allParts.length} parts successfully!`);
  }
}

checkCourses()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
