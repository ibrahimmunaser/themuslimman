import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [userCount, orgCount, classCount] = await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.class.count(),
    ]);

    return NextResponse.json({
      status: "ok",
      database: "connected",
      counts: { users: userCount, organizations: orgCount, classes: classCount },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "error", database: "unreachable", error: message },
      { status: 503 }
    );
  }
}
