import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const templates = await p.courseTemplate.findMany({
  select: { id: true, title: true, isActive: true, createdAt: true },
});
console.log("CourseTemplates:", templates);

// Also check abe_teacher's session-visible data
const user = await p.user.findFirst({
  where: { username: "abe_teacher" },
  include: {
    teacher: { select: { id: true, isActive: true } },
  },
  select: {
    id: true,
    username: true,
    organizationId: true,
    role: true,
    isActive: true,
    teacher: true,
  },
});
console.log("\nabe_teacher full record:", user);

await p.$disconnect();
