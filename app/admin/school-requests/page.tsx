import Link from "next/link";
import {
  Building2, Mail, Phone, MapPin, Users, Calendar,
  CheckCircle2, XCircle, PhoneCall, Clock, ChevronRight,
} from "lucide-react";
import { requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ContactedButton } from "./contacted-button";

export const metadata = { title: "School Access Requests" };
export const dynamic  = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  new:       "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  contacted: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  approved:  "bg-green-500/10 text-green-400 border border-green-500/20",
  rejected:  "bg-red-500/10 text-red-400 border border-red-500/20",
};

const STATUS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  new:       Clock,
  contacted: PhoneCall,
  approved:  CheckCircle2,
  rejected:  XCircle,
};

function orgTypeLabel(t: string | null) {
  if (!t) return null;
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmt(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(date);
}

type StatusFilter = "all" | "new" | "contacted" | "approved" | "rejected";

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function SchoolRequestsPage({ searchParams }: Props) {
  await requirePlatformAdmin();

  const { status: rawStatus } = await searchParams;
  const activeFilter: StatusFilter =
    ["new", "contacted", "approved", "rejected"].includes(rawStatus ?? "")
      ? (rawStatus as StatusFilter)
      : "all";

  const where = activeFilter === "all" ? {} : { status: activeFilter };

  const [requests, counts] = await Promise.all([
    prisma.organizationAccessRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    }),
    prisma.organizationAccessRequest.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  const countMap: Record<string, number> = { new: 0, contacted: 0, approved: 0, rejected: 0 };
  let total = 0;
  for (const row of counts) {
    countMap[row.status] = row._count.id;
    total += row._count.id;
  }

  const tabs: Array<{ key: StatusFilter; label: string; count: number }> = [
    { key: "all",       label: "All",       count: total },
    { key: "new",       label: "New",       count: countMap.new },
    { key: "contacted", label: "Contacted", count: countMap.contacted },
    { key: "approved",  label: "Approved",  count: countMap.approved },
    { key: "rejected",  label: "Rejected",  count: countMap.rejected },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-text mb-1">School Access Requests</h1>
        <p className="text-text-secondary text-sm">
          Review and approve mosque/school organization requests.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "all" ? "/admin/school-requests" : `/admin/school-requests?status=${tab.key}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
              activeFilter === tab.key
                ? "bg-gold/10 border-gold/30 text-gold"
                : "border-border bg-surface text-text-secondary hover:text-text hover:border-border-subtle"
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-md ${
              activeFilter === tab.key ? "bg-gold/20 text-gold" : "bg-surface-raised text-text-muted"
            }`}>
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Request list */}
      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <Building2 className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary text-sm">
            {activeFilter === "all" ? "No requests yet." : `No ${activeFilter} requests.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const StatusIcon = STATUS_ICON[req.status] ?? Clock;
            const orgType = orgTypeLabel(req.organizationType);
            return (
              <div
                key={req.id}
                className="rounded-2xl border border-border bg-surface p-5 sm:p-6 hover:border-border-subtle transition-colors"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Left: details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h2 className="text-base font-semibold text-text">{req.organizationName}</h2>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_BADGE[req.status] ?? STATUS_BADGE.new}`}>
                        <StatusIcon className="w-3 h-3" />
                        {req.status}
                      </span>
                      {orgType && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border border-border bg-surface-raised text-text-muted">
                          {orgType}
                        </span>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-y-1.5 gap-x-6 text-sm mb-3">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Users className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                        {req.contactName}
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                        <a href={`mailto:${req.contactEmail}`} className="text-gold hover:text-gold-light transition-colors truncate">
                          {req.contactEmail}
                        </a>
                      </div>
                      {req.contactPhone && (
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Phone className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                          {req.contactPhone}
                        </div>
                      )}
                      {(req.city || req.country) && (
                        <div className="flex items-center gap-2 text-text-secondary">
                          <MapPin className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                          {[req.city, req.country].filter(Boolean).join(", ")}
                        </div>
                      )}
                      {req.estimatedStudents && (
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Users className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                          {req.estimatedStudents} students
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-text-muted">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-xs">{fmt(req.createdAt)}</span>
                      </div>
                    </div>

                    {req.message && (
                      <p className="text-xs text-text-muted leading-relaxed border-l-2 border-border pl-3 italic">
                        {req.message}
                      </p>
                    )}

                    {req.rejectionReason && (
                      <p className="text-xs text-red-400 mt-2">
                        Rejection reason: {req.rejectionReason}
                      </p>
                    )}
                  </div>

                  {/* Right: actions */}
                  <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                    {req.status === "approved" ? (
                      <Link
                        href={`/admin/school-requests/${req.id}/approve`}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    ) : req.status === "rejected" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        <XCircle className="w-3.5 h-3.5" />
                        Rejected
                      </span>
                    ) : (
                      <>
                        <Link
                          href={`/admin/school-requests/${req.id}/approve`}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gold text-ink hover:bg-gold-light transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                        {req.status === "new" && (
                          <ContactedButton requestId={req.id} />
                        )}
                        <Link
                          href={`/admin/school-requests/${req.id}/reject`}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

