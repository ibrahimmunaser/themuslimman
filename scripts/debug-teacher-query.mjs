import { PrismaClient } from "@prisma/client";
const p = new PrismaClient({ log: ["query"] });

const orgId          = "cmodakpn80000upykwsqen335";
const teacherProfile = "cmodim18h000cup98n0on9egd";

console.log("\n=== Current query (nested via orgAccess.teacherAccess) ===");
const q1 = await p.courseTemplate.findMany({
  where: {
    isActive: true,
    orgAccess: {
      some: {
        organizationId: orgId,
        OR: [
          { availableToAll: true },
          { teacherAccess: { some: { teacherProfileId: teacherProfile } } },
        ],
      },
    },
  },
  select: { id: true, title: true },
});
console.log("Results:", q1);

console.log("\n=== Simpler direct query via CourseTemplate.teacherAccess ===");
const q2 = await p.courseTemplate.findMany({
  where: {
    isActive: true,
    OR: [
      { orgAccess: { some: { organizationId: orgId, availableToAll: true } } },
      { teacherAccess: { some: { organizationId: orgId, teacherProfileId: teacherProfile } } },
    ],
  },
  select: { id: true, title: true },
});
console.log("Results:", q2);

await p.$disconnect();
