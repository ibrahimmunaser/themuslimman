import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, XCircle } from "lucide-react";
import { requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rejectSchoolRequest } from "@/lib/school-requests-admin";

export const metadata = { title: "Reject Organization Request" };
export const dynamic  = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RejectPage({ params }: Props) {
  await requirePlatformAdmin();
  const { id } = await params;
  const request = await prisma.organizationAccessRequest.findUnique({ where: { id } });
  if (!request) notFound();

  if (request.status === "rejected") redirect("/admin/school-requests");

  async function handleReject(formData: FormData) {
    "use server";
    const reason = (formData.get("reason") as string | null)?.trim() || undefined;
    await rejectSchoolRequest(id, reason);
    redirect("/admin/school-requests");
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-xl mx-auto">
      <Link
        href="/admin/school-requests"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-gold transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Back to requests
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">Reject Request</h1>
            <p className="text-text-secondary text-sm">{request.organizationName}</p>
          </div>
        </div>
        <p className="text-text-secondary text-sm">
          This will mark the request as rejected. You can optionally include a reason.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface-raised p-4 mb-6 text-sm text-text-secondary">
        <p><span className="text-text font-medium">{request.contactName}</span> · {request.contactEmail}</p>
      </div>

      <form action={handleReject} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Rejection reason <span className="text-text-muted font-normal">(optional, internal only)</span>
          </label>
          <textarea
            name="reason"
            rows={3}
            placeholder="e.g. Not a valid educational organization, duplicate request..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/30 transition-colors resize-none"
          />
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/school-requests"
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-border bg-surface text-text-secondary text-sm font-medium hover:text-text transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/90 hover:bg-red-500 text-white text-sm font-semibold transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Confirm Rejection
          </button>
        </div>
      </form>
    </div>
  );
}
