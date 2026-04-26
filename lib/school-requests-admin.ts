"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/auth";

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

function usernameify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s._-]/g, "")
    .replace(/\s+/g, ".")
    .slice(0, 30);
}

// ── rejectSchoolRequest ───────────────────────────────────────────────────────

export async function rejectSchoolRequest(
  requestId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const admin = await requirePlatformAdmin();

  try {
    await prisma.organizationAccessRequest.update({
      where: { id: requestId },
      data: {
        status:         "rejected",
        rejectedAt:     new Date(),
        rejectionReason: reason?.trim() || null,
        approvedById:   admin.id,
      },
    });
    revalidatePath("/admin/school-requests");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update request." };
  }
}

// ── markContacted ─────────────────────────────────────────────────────────────

export async function markContacted(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  await requirePlatformAdmin();

  try {
    await prisma.organizationAccessRequest.update({
      where: { id: requestId },
      data:  { status: "contacted" },
    });
    revalidatePath("/admin/school-requests");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update request." };
  }
}

// ── Slug / username generators (called from client) ───────────────────────────

export async function generateOrgSlug(name: string): Promise<string> {
  const base = slugify(name);
  // Check if base slug is free
  const existing = await prisma.organization.findUnique({ where: { slug: base } });
  if (!existing) return base;
  // Append short random suffix
  return `${base}-${nanoid(4).toLowerCase()}`;
}

export async function generateAdminUsername(contactName: string): Promise<string> {
  const base = usernameify(contactName);
  const existing = await prisma.user.findUnique({ where: { username: base } });
  if (!existing) return base;
  return `${base}-${nanoid(4).toLowerCase()}`;
}
