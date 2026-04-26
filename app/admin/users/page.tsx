import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { roleLabel } from "@/lib/roles";

export const metadata = { title: "Users" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, fullName: true, email: true, role: true, createdAt: true },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-text mb-1">Users</h1>
      <p className="text-text-secondary text-sm mb-6">All accounts on the platform.</p>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-raised border-b border-border">
            <tr className="text-left">
              <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-surface-raised/50 transition-colors">
                <td className="px-4 py-3 text-sm text-text">{u.fullName}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gold/10 text-gold text-xs font-medium">
                    {roleLabel(u.role as "admin" | "teacher" | "student")}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-text-muted tabular-nums">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
