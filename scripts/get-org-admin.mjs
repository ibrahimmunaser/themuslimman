import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const u = await p.user.findFirst({
  where: { role: "org_admin" },
  select: { username: true, fullName: true, organizationId: true },
});
console.log(u);
await p.$disconnect();
