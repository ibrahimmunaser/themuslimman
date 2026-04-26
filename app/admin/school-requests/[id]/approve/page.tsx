import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CheckCircle2, Building2, Calendar, KeyRound } from "lucide-react";
import { requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateOrgSlug, generateAdminUsername } from "@/lib/school-requests-admin";
import { ApproveForm } from "./approve-form";

export const metadata = { title: "Approve Organization Request" };
export const dynamic  = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

function fmt(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(date);
}

export default async function ApprovePage({ params }: Props) {
  await requirePlatformAdmin();

  const { id } = await params;
  const request = await prisma.organizationAccessRequest.findUnique({ where: { id } });

  if (!request) notFound();

  // ── Already approved ───────────────────────────────────────────────────────
  if (request.status === "approved") {
    // Look up the organization that was created for this request so we can
    // show useful details and offer the password-reset tool.
    const org = await prisma.organization.findFirst({
      where: { name: request.organizationName },
      include: {
        plan: true,
        users: {
          where: { role: "org_admin" },
          orderBy: { createdAt: "asc" },
          take: 1,
          select: { username: true, email: true, fullName: true, mustChangePassword: true },
        },
      },
    });

    const orgAdmin = org?.users[0];

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <Link
          href="/admin/school-requests"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-gold transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to requests
        </Link>

        {/* Approved banner */}
        <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400 font-semibold">Already approved</p>
          </div>
          <p className="text-text-secondary text-sm">
            This request was approved{request.approvedAt ? ` on ${fmt(request.approvedAt)}` : ""} and the organization has been created.
            The temporary password is not stored and cannot be retrieved — use the reset tool if needed.
          </p>
        </div>

        {/* Organization details */}
        {org && (
          <div className="rounded-xl border border-border bg-surface-raised p-5 mb-6 text-sm space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Building2 className="w-4 h-4 text-gold" />
              <span className="text-sm font-semibold text-gold">Organization Details</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-y-2 gap-x-6 text-text-secondary">
              <div>
                <p className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">Name</p>
                <p className="text-text font-medium">{org.name}</p>
              </div>
              <div>
                <p className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">Slug</p>
                <p className="font-mono">{org.slug}</p>
              </div>
              {org.plan && (
                <div>
                  <p className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">Plan</p>
                  <p className="capitalize">{org.plan.planType} · {org.plan.studentLimit} students · {org.plan.teacherLimit} teachers</p>
                </div>
              )}
              <div>
                <p className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">Created</p>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-text-muted" />
                  <p>{fmt(org.createdAt ?? request.approvedAt ?? new Date())}</p>
                </div>
              </div>
            </div>

            {orgAdmin && (
              <div className="pt-3 border-t border-border grid sm:grid-cols-2 gap-y-2 gap-x-6 text-text-secondary">
                <div>
                  <p className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">Org admin</p>
                  <p className="text-text font-medium">{orgAdmin.fullName}</p>
                </div>
                <div>
                  <p className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">Username</p>
                  <p className="font-mono">{orgAdmin.username ?? "—"}</p>
                </div>
                {orgAdmin.email && (
                  <div>
                    <p className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">Email</p>
                    <p>{orgAdmin.email}</p>
                  </div>
                )}
                <div>
                  <p className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">Password status</p>
                  <p className={orgAdmin.mustChangePassword ? "text-amber-400" : "text-green-400"}>
                    {orgAdmin.mustChangePassword ? "Must change on next login" : "Password set"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reset password tool — navigates to its own page to avoid server-component re-render race */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-sm font-semibold text-text mb-1">Need to resend credentials?</p>
          <p className="text-xs text-text-muted mb-4">
            If the org admin lost their temporary password, generate a new one. It will be shown only once.
          </p>
          <Link
            href={`/admin/school-requests/${id}/reset-admin-password`}
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-border bg-surface-raised text-text-secondary hover:text-text hover:border-border-subtle transition-colors text-sm font-medium"
          >
            <KeyRound className="w-4 h-4" />
            Reset org admin password
          </Link>
        </div>
      </div>
    );
  }

  // ── Not yet approved — show the approval form ──────────────────────────────
  const [suggestedSlug, suggestedUsername] = await Promise.all([
    generateOrgSlug(request.organizationName),
    generateAdminUsername(request.contactName),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <Link
        href="/admin/school-requests"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-gold transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Back to requests
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">Approve Request</h1>
        <p className="text-text-secondary text-sm">
          Review and finalize the organization details before creating the account.
        </p>
      </div>

      {/* Request summary */}
      <div className="rounded-xl border border-border bg-surface-raised p-4 mb-8 text-sm">
        <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Request from</p>
        <div className="space-y-1 text-text-secondary">
          <p><span className="text-text font-medium">{request.organizationName}</span></p>
          <p>{request.contactName} · <a href={`mailto:${request.contactEmail}`} className="text-gold hover:text-gold-light">{request.contactEmail}</a></p>
          {request.contactPhone && <p>{request.contactPhone}</p>}
          {(request.city || request.country) && (
            <p>{[request.city, request.country].filter(Boolean).join(", ")}</p>
          )}
          {request.estimatedStudents && <p>~{request.estimatedStudents} students</p>}
          {request.message && (
            <p className="italic text-text-muted pt-1 border-t border-border mt-1">
              &ldquo;{request.message}&rdquo;
            </p>
          )}
        </div>
      </div>

      <ApproveForm
        request={{
          id:               request.id,
          organizationName: request.organizationName,
          contactName:      request.contactName,
          contactEmail:     request.contactEmail,
          organizationType: request.organizationType,
          estimatedStudents: request.estimatedStudents,
        }}
        suggestedSlug={suggestedSlug}
        suggestedUsername={suggestedUsername}
      />
    </div>
  );
}
