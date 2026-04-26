import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Students" };
export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  await requireAdmin();
  const students = await prisma.studentProfile.findMany({
    include: {
      user: { select: { fullName: true, email: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-text mb-1">Students</h1>
      <p className="text-text-secondary text-sm mb-6">{students.length} students on the platform.</p>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-raised border-b border-border">
            <tr className="text-left">
              <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Programs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-surface-raised/50 transition-colors">
                <td className="px-4 py-3 text-sm text-text">{s.user.fullName}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{s.user.email}</td>
                <td className="px-4 py-3 text-sm text-text-muted tabular-nums">{s._count.enrollments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
