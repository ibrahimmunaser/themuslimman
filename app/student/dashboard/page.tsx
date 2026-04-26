import Link from "next/link";
import {
  GraduationCap,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  KeyRound,
  Play,
} from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { getStudentDashboardData } from "@/lib/queries/student";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Student Dashboard" };

export default async function StudentDashboardPage() {
  const user = await requireStudent();
  if (!user.studentProfileId) {
    return (
      <div className="p-8">
        <EmptyState
          icon={GraduationCap}
          title="Student profile not set up"
          description="Contact support if this persists."
        />
      </div>
    );
  }

  const data = await getStudentDashboardData(user.studentProfileId);

  const totalReleased = data.enrollments.reduce(
    (sum, e) => sum + e.class.releaseRules.length,
    0
  );
  const completedProgress = data.recentProgress.filter((p) => p.status === "completed").length;
  const inProgress = data.recentProgress.find((p) => p.status === "in_progress");

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <p className="text-text-muted text-sm mb-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-text">
          As-salamu alaykum, {user.fullName.split(" ")[0]}
        </h1>
        <p className="text-text-secondary mt-1 text-sm">
          {data.enrollments.length > 0
            ? "Continue your Seerah journey."
            : "Join a program to get started."}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        <StatCard
          label="Programs"
          value={data.enrollments.length}
          icon={GraduationCap}
          tone="gold"
        />
        <StatCard
          label="Released lessons"
          value={totalReleased}
          icon={BookOpen}
        />
        <StatCard
          label="Completed"
          value={completedProgress}
          icon={CheckCircle2}
          tone="success"
        />
      </div>

      {inProgress && (
        <div className="mb-8">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-3">
            Continue where you left off
          </p>
          <Link
            href={`/student/classes/${inProgress.class?.id}/lesson/${inProgress.classCourseItem.seerahPart.slug}`}
            className="group flex items-center gap-4 p-5 rounded-2xl border border-border bg-surface hover:border-gold/30 hover:bg-surface-raised transition-all"
          >
            <div className="w-14 h-14 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 group-hover:border-gold/40 transition-colors">
              <Play className="w-6 h-6 text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-muted mb-0.5">{inProgress.class?.title}</p>
              <p className="font-semibold text-text truncate">
                Part {inProgress.classCourseItem.seerahPart.partNumber}:{" "}
                {inProgress.classCourseItem.seerahPart.title}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <ProgressBar value={inProgress.completionPercentage} className="w-40" size="sm" />
                <span className="text-xs text-text-muted tabular-nums">
                  {inProgress.completionPercentage}%
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-gold transition-colors flex-shrink-0" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-text-muted uppercase tracking-wider">Your programs</p>
            <Link
              href="/student/classes"
              className="text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-1"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {data.enrollments.length === 0 ? (
            <EmptyState
              icon={KeyRound}
              title="No programs yet"
              description="Join a program to start learning."
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
            <div className="space-y-3">
              {data.enrollments.map(({ class: cls }) => {
                const totalItems = cls.classCourse?.items.length ?? 0;
                const released = cls.releaseRules.length;
                return (
                  <Link
                    key={cls.id}
                    href={`/student/classes/${cls.id}`}
                    className="block group"
                  >
                    <div className="p-5 rounded-2xl border border-border bg-surface hover:border-gold/30 hover:bg-surface-raised transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-text group-hover:text-gold transition-colors truncate">
                            {cls.title}
                          </p>
                          <div className="mt-3 flex items-center gap-3">
                            <ProgressBar
                              value={totalItems > 0 ? (released / totalItems) * 100 : 0}
                              className="flex-1"
                              size="sm"
                            />
                            <span className="text-xs text-text-muted tabular-nums flex-shrink-0">
                              {released} / {totalItems}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-gold transition-colors flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
