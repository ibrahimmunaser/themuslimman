import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateTempPassword } from "@/lib/utils";

export const dynamic = "force-dynamic";

const BCRYPT_ROUNDS = 10;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "platform_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: requestId } = await params;

  // Find the approved access request
  const accessRequest = await prisma.organizationAccessRequest.findUnique({
    where: { id: requestId },
  });

  if (!accessRequest) {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }

  if (accessRequest.status !== "approved") {
    return NextResponse.json(
      { error: "This request has not been approved yet." },
      { status: 400 }
    );
  }

  // Find the org admin for this organization (matched by org name/slug look-up via the
  // organization that was created at approval time)
  const org = await prisma.organization.findFirst({
    where: {
      name: accessRequest.organizationName,
    },
    include: {
      users: {
        where: { role: "org_admin" },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  if (!org || org.users.length === 0) {
    return NextResponse.json(
      { error: "Could not find the organization admin account. The organization may not exist." },
      { status: 404 }
    );
  }

  const orgAdmin = org.users[0];

  const tempPassword = generateTempPassword(12);
  const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);

  await prisma.user.update({
    where: { id: orgAdmin.id },
    data: {
      passwordHash,
      mustChangePassword:      true,
      tempPasswordGeneratedAt: new Date(),
    },
  });

  return NextResponse.json({
    success:      true,
    orgName:      org.name,
    username:     orgAdmin.username,
    tempPassword,
    loginUrl:     "/login?mode=organization",
  });
}
