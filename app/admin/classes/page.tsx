import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { StatusBadge } from "@/components/ui/status-badge";

export const metadata = { title: "All Classes" };
export const dynamic = "force-dynamic";

export default async function AdminClassesPage() {
  await requireAdmin();
  const classes = await prisma.class.findMany({
    include: {
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-text mb-1">Classes</h1>
      <p className="text-text-secondary text-sm mb-6">All classes across the platform.</p>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-raised border-b border-border">
            <tr className="text-left">
              <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Title</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Students</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {classes.map((c) => (
              <tr key={c.id} className="hover:bg-surface-raised/50 transition-colors">
                <td className="px-4 py-3 text-sm text-text">{c.title}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={c.status === "active" ? "active" : c.status === "archived" ? "archived" : "draft"}
                  />
                </td>
                <td className="px-4 py-3 text-sm text-text-muted tabular-nums">{c._count.enrollments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
