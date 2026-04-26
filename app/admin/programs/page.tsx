import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { StatusBadge } from "@/components/ui/status-badge";
import { GraduationCap } from "lucide-react";

export const metadata = { title: "Programs" };
export const dynamic = "force-dynamic";

export default async function AdminProgramsPage() {
  await requireAdmin();
  
  // Programs are platform-run student experiences (formerly called "classes")
  const programs = await prisma.class.findMany({
    include: {
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-text mb-1">Programs</h1>
        <p className="text-text-secondary text-sm">
          Platform-run student experiences like cohorts, challenges, and self-paced programs.
        </p>
      </div>

      {programs.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-border bg-surface">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-text-muted">No programs yet</p>
          <p className="text-sm text-text-secondary mt-1">
            Create your first program to start engaging students
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-raised border-b border-border">
              <tr className="text-left">
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Program</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Students</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Dates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {programs.map((program) => (
                <tr key={program.id} className="hover:bg-surface-raised/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-text">{program.title}</p>
                    {program.description && (
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{program.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={program.status === "active" ? "active" : program.status === "archived" ? "archived" : "draft"}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-text-muted tabular-nums">
                    {program._count.enrollments} enrolled
                  </td>
                  <td className="px-4 py-3 text-xs text-text-muted">
                    {program.startDate && program.endDate ? (
                      <>
                        {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}
                      </>
                    ) : program.startDate ? (
                      <>Starts {new Date(program.startDate).toLocaleDateString()}</>
                    ) : (
                      "Self-paced"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
