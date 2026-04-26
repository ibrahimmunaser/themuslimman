import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateTempPassword } from "@/lib/utils";

export const dynamic = "force-dynamic";

const BCRYPT_ROUNDS = 10;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

interface ApproveBody {
  orgName:       string;
  orgSlug:       string;
  timezone:      string;
  planType:      string;
  studentLimit:  number;
  teacherLimit:  number;
  adminFullName: string;
  adminUsername: string;
  adminEmail:    string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "platform_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: requestId } = await params;

  // Check the access request exists and is not already approved
  const accessRequest = await prisma.organizationAccessRequest.findUnique({
    where: { id: requestId },
  });

  if (!accessRequest) {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }

  if (accessRequest.status === "approved") {
    return NextResponse.json(
      { error: "This request has already been approved." },
      { status: 409 }
    );
  }

  let body: ApproveBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Validate slug
  const slug = slugify(body.orgSlug ?? "");
  if (!slug) {
    return NextResponse.json({ error: "Invalid organization slug." }, { status: 400 });
  }

  // Validate username
  const username = (body.adminUsername ?? "").trim().toLowerCase();
  if (!username || username.length < 3) {
    return NextResponse.json(
      { error: "Admin username must be at least 3 characters." },
      { status: 400 }
    );
  }
  if (!/^[a-z0-9._-]+$/.test(username)) {
    return NextResponse.json(
      { error: "Username may only contain letters, numbers, dots, hyphens, underscores." },
      { status: 400 }
    );
  }

  // Check uniqueness
  const [existingOrg, existingUser] = await Promise.all([
    prisma.organization.findUnique({ where: { slug } }),
    prisma.user.findUnique({ where: { username } }),
  ]);
  if (existingOrg) {
    return NextResponse.json(
      { error: `Slug "${slug}" is already taken.` },
      { status: 409 }
    );
  }
  if (existingUser) {
    return NextResponse.json(
      { error: `Username "${username}" is already taken.` },
      { status: 409 }
    );
  }

  if (body.adminEmail) {
    const emailLower = body.adminEmail.trim().toLowerCase();
    const existingEmail = await prisma.user.findUnique({ where: { email: emailLower } });
    if (existingEmail) {
      return NextResponse.json(
        { error: `Email "${emailLower}" is already registered.` },
        { status: 409 }
      );
    }
  }

  // Generate and hash temp password
  const tempPassword = generateTempPassword(12);
  const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);

  // All-or-nothing transaction
  await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name:         (body.orgName ?? "").trim(),
        slug,
        contactEmail: body.adminEmail ? body.adminEmail.trim().toLowerCase() : null,
        timezone:     body.timezone || "UTC",
        isActive:     true,
      },
    });

    await tx.organizationPlan.create({
      data: {
        organizationId: org.id,
        planType:       body.planType || "pilot",
        studentLimit:   body.studentLimit ?? 50,
        teacherLimit:   body.teacherLimit ?? 3,
        status:         "active",
        startsAt:       new Date(),
      },
    });

    await tx.user.create({
      data: {
        fullName:                (body.adminFullName ?? "").trim(),
        username,
        email:                   body.adminEmail ? body.adminEmail.trim().toLowerCase() : null,
        passwordHash,
        role:                    "org_admin",
        accountType:             "organization_managed",
        organizationId:          org.id,
        mustChangePassword:      true,
        tempPasswordGeneratedAt: new Date(),
        isActive:                true,
      },
    });

    await tx.organizationAccessRequest.update({
      where: { id: requestId },
      data: {
        status:       "approved",
        approvedAt:   new Date(),
        approvedById: user.id,
      },
    });
  });

  // Return plaintext password only in this immediate response — never stored
  return NextResponse.json({
    success:      true,
    orgName:      (body.orgName ?? "").trim(),
    username,
    tempPassword,
    loginUrl:     "/login?mode=organization",
  });
}
