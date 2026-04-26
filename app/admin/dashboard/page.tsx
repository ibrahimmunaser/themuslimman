import Link from "next/link";
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Library,
  ShoppingCart,
  ChevronRight,
  ShieldCheck,
  Activity,
  Award,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/queries/admin";
import { StatCard } from "@/components/ui/stat-card";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  const data = await getAdminDashboardData();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-gold" />
          <p className="text-xs text-gold uppercase tracking-wider font-semibold">
            Platform admin
          </p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text">
          Platform overview
        </h1>
        <p className="text-text-secondary mt-1 text-sm">
          Welcome back, {user.fullName}.
        </p>
      </div>

      {/* Platform KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <StatCard label="Total students" value={data.totalStudents} icon={Users} tone="gold" />
        <StatCard label="Active students" value={data.activeStudents} icon={Activity} tone="success" />
        <StatCard label="Programs" value={data.totalPrograms} icon={GraduationCap} />
        <StatCard label="Active programs" value={data.activePrograms} icon={BookOpen} />
        <StatCard label="Enrollments" value={data.totalEnrollments} icon={Users} />
        <StatCard label="Completions" value={data.completionStats._count} icon={Award} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Quiz Performance */}
        <div className="p-6 rounded-2xl border border-border bg-surface">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-gold" />
            <p className="text-xs text-text-muted uppercase tracking-wider">Quiz performance</p>
          </div>
          <p className="text-3xl font-bold text-text tabular-nums">
            {data.quizStats._avg.score !== null && data.quizStats._avg.score !== undefined
              ? `${Math.round(data.quizStats._avg.score)}%`
              : "—"}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {data.quizStats._count} total quiz submissions
          </p>
        </div>

        {/* Quick Actions */}
        <div className="p-6 rounded-2xl border border-border bg-surface">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-3">
            Quick actions
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/admin/students"
              className="flex items-center gap-2 p-3 rounded-xl border border-border bg-surface-raised hover:border-gold/30 transition-all text-sm text-text-secondary hover:text-text"
            >
              <Users className="w-4 h-4 text-gold" />
              Students
            </Link>
            <Link
              href="/admin/courses"
              className="flex items-center gap-2 p-3 rounded-xl border border-border bg-surface-raised hover:border-gold/30 transition-all text-sm text-text-secondary hover:text-text"
            >
              <BookOpen className="w-4 h-4 text-gold" />
              Courses
            </Link>
            <Link
              href="/admin/content"
              className="flex items-center gap-2 p-3 rounded-xl border border-border bg-surface-raised hover:border-gold/30 transition-all text-sm text-text-secondary hover:text-text"
            >
              <Library className="w-4 h-4 text-gold" />
              Content
            </Link>
            <Link
              href="/admin/programs"
              className="flex items-center gap-2 p-3 rounded-xl border border-border bg-surface-raised hover:border-gold/30 transition-all text-sm text-text-secondary hover:text-text"
            >
              <GraduationCap className="w-4 h-4 text-gold" />
              Programs
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Student Signups */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-text-muted uppercase tracking-wider">Recent student signups</p>
          <Link
            href="/admin/students"
            className="text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-1"
          >
            All students <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-raised border-b border-border">
              <tr className="text-left">
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Last login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.recentSignups.map((u) => (
                <tr key={u.id} className="hover:bg-surface-raised/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-text">{u.fullName}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{u.email}</td>
                  <td className="px-4 py-3 text-sm text-text-muted tabular-nums">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-muted tabular-nums">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
