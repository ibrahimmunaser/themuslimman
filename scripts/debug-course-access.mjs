import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const tca = await p.teacherCourseAccess.findMany({
  include: {
    teacher: { include: { user: { select: { username: true, fullName: true } } } },
    courseTemplate: { select: { title: true } },
    orgAccess: { select: { id: true, availableToAll: true } },
  },
});
console.log("\n=== TeacherCourseAccess ===");
for (const r of tca) {
  console.log({
    id: r.id,
    teacher: r.teacher.user.username ?? r.teacher.user.fullName,
    course: r.courseTemplate.title,
    orgCourseAccessId: r.orgCourseAccessId,
    orgAccessExists: !!r.orgAccess,
    availableToAll: r.orgAccess?.availableToAll,
    organizationId: r.organizationId,
    teacherProfileId: r.teacherProfileId,
    courseTemplateId: r.courseTemplateId,
  });
}

const oca = await p.orgCourseAccess.findMany({
  include: { courseTemplate: { select: { title: true } } },
});
console.log("\n=== OrgCourseAccess ===");
for (const r of oca) {
  console.log({
    id: r.id,
    course: r.courseTemplate.title,
    organizationId: r.organizationId,
    availableToAll: r.availableToAll,
  });
}

// Check what teacherProfileId the abe_teacher user has
const teacher = await p.user.findFirst({
  where: { username: "abe_teacher" },
  include: { teacher: { select: { id: true, isActive: true } } },
});
console.log("\n=== abe_teacher user ===");
console.log({
  userId: teacher?.id,
  username: teacher?.username,
  organizationId: teacher?.organizationId,
  teacherProfileId: teacher?.teacher?.id,
  teacherIsActive: teacher?.teacher?.isActive,
  role: teacher?.role,
  isActive: teacher?.isActive,
});

await p.$disconnect();
