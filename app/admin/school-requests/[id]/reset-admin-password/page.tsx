import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ResetForm } from "./reset-form";

export const metadata = { title: "Reset Org Admin Password" };
export const dynamic  = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ResetAdminPasswordPage({ params }: Props) {
  await requirePlatformAdmin();

  const { id } = await params;

  const request = await prisma.organizationAccessRequest.findUnique({
    where: { id },
  });

  if (!request) notFound();

  if (request.status !== "approved") {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <Link
          href="/admin/school-requests"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-gold transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to requests
        </Link>
        <div className="rounded-2xl border border-red-500/30 bg-surface p-8 text-center">
          <p className="text-red-400 font-semibold mb-2">Not approved yet</p>
          <p className="text-text-secondary text-sm">
            This request has not been approved — there is no org admin account to reset.
          </p>
        </div>
      </div>
    );
  }

  // Look up the org admin so we can display context before the admin confirms
  const org = await prisma.organization.findFirst({
    where: { name: request.organizationName },
    include: {
      users: {
        where: { role: "org_admin" },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { username: true, fullName: true },
      },
    },
  });

  const orgAdmin = org?.users[0] ?? null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <Link
        href={`/admin/school-requests/${id}/approve`}
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-gold transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Back to request details
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">Reset Org Admin Password</h1>
        <p className="text-text-secondary text-sm">
          Generate a new temporary password for the organization admin.
          The new password will be shown once only.
        </p>
      </div>

      <ResetForm
        requestId={id}
        orgName={request.organizationName}
        username={orgAdmin?.username ?? null}
      />
    </div>
  );
}
