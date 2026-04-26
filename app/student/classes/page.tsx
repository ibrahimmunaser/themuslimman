import Link from "next/link";
import { KeyRound, GraduationCap, ChevronRight } from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { getStudentDashboardData } from "@/lib/queries/student";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = { title: "My Programs" };

export default async function StudentClassesPage() {
  const user = await requireStudent();
  if (!user.studentProfileId) return null;
  const { enrollments } = await getStudentDashboardData(user.studentProfileId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">My Programs</h1>
          <p className="text-text-secondary mt-1 text-sm">
            Your enrolled Seerah learning programs.
          </p>
        </div>
        <Link href="/student/join">
          <Button variant="outline" size="md">
            <KeyRound className="w-4 h-4" />
            Join with code
          </Button>
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No programs yet"
          description="Join a program to start your Seerah journey."
          action={
            <Link href="/student/join">
              <Button variant="primary" size="md">
                <KeyRound className="w-4 h-4" />
                Join a program
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrollments.map(({ class: cls }) => {
            const totalItems = cls.classCourse?.items.length ?? 0;
            const released = cls.releaseRules.length;
            return (
              <Link key={cls.id} href={`/student/classes/${cls.id}`} className="block group">
                <div className="p-5 rounded-2xl border border-border bg-surface hover:border-gold/30 hover:bg-surface-raised transition-all h-full">
                  <p className="font-semibold text-text group-hover:text-gold transition-colors truncate">
                    {cls.title}
                  </p>
                  {cls.description && (
                    <p className="text-xs text-text-secondary mt-2 line-clamp-2">{cls.description}</p>
                  )}
                  <div className="mt-4 flex items-center gap-3">
                    <ProgressBar
                      value={totalItems > 0 ? (released / totalItems) * 100 : 0}
                      size="sm"
                      className="flex-1"
                    />
                    <span className="text-xs text-text-muted tabular-nums">
                      {released} / {totalItems}
                    </span>
                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-gold transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
