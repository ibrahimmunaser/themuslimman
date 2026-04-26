import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const users = await p.user.findMany({
  where: { role: "org_admin" },
  select: { username: true, fullName: true, organizationId: true, mustChangePassword: true },
});
console.log(users);
await p.$disconnect();
