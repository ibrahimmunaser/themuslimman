import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  Unlock,
  CheckCircle2,
  BookOpen,
  Megaphone,
  Play,
  User,
} from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { getStudentClassView } from "@/lib/queries/student";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ classId: string }>;
}

export default async function StudentClassViewPage({ params }: Props) {
  const user = await requireStudent();
  if (!user.studentProfileId) notFound();

  const { classId } = await params;
  const view = await getStudentClassView(user.studentProfileId, classId);
  if (!view) notFound();

  const { enrollment, progressByItem } = view;
  const cls = enrollment.class;

  const ruleByItem = new Map(
    cls.releaseRules.filter((r) => r.classCourseItemId).map((r) => [r.classCourseItemId!, r])
  );

  const items = cls.classCourse?.items ?? [];
  const totalItems = items.length;
  const releasedCount = items.filter((i) => ruleByItem.get(i.id)?.isReleased).length;
  const completedCount = items.filter((i) => progressByItem.get(i.id)?.status === "completed").length;

  const grouped = new Map<string, typeof items>();
  for (const item of items) {
    const key = item.moduleName ?? "Module";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <Link
        href="/student/classes"
        className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All classes
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-text">{cls.title}</h1>
        <div className="flex items-center gap-3 mt-2 text-sm text-text-secondary">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-gold" />
            {cls.teacher.user.fullName}
          </span>
          <span className="text-text-muted">·</span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {releasedCount} / {totalItems} released
          </span>
        </div>
        {cls.description && (
          <p className="text-text-secondary text-sm mt-3">{cls.description}</p>
        )}
      </div>

      <div className="mb-6 p-5 rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-text-muted uppercase tracking-wider">Your progress</p>
          <span className="text-xs text-text-muted tabular-nums">
            {completedCount} of {totalItems} completed
          </span>
        </div>
        <ProgressBar value={totalItems > 0 ? (completedCount / totalItems) * 100 : 0} tone="gold" />
      </div>

      {cls.announcements.length > 0 && (
        <div className="mb-8">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Announcements</p>
          <div className="space-y-2">
            {cls.announcements.map((a) => (
              <div key={a.id} className="p-4 rounded-xl border border-gold/20 bg-gold/5">
                <div className="flex items-center gap-2 mb-1">
                  <Megaphone className="w-3.5 h-3.5 text-gold" />
                  <p className="text-sm font-semibold text-text">{a.title}</p>
                </div>
                <p className="text-sm text-text-secondary">{a.body}</p>
                {a.publishedAt && (
                  <p className="text-[10px] text-text-muted mt-2">
                    {new Date(a.publishedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-text-muted uppercase tracking-wider mb-4">Curriculum</p>

      {items.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Curriculum not set up yet"
          description="Your teacher hasn&apos;t built the curriculum yet. Check back soon."
        />
      ) : (
        <div className="space-y-4">
          {[...grouped.entries()].map(([moduleName, moduleItems]) => (
            <div key={moduleName} className="rounded-2xl border border-border bg-surface overflow-hidden">
              <div className="px-5 py-3 bg-surface-raised border-b border-border">
                <p className="text-xs font-semibold uppercase tracking-wider text-gold">{moduleName}</p>
              </div>
              <ul className="divide-y divide-border">
                {moduleItems.map((item) => {
                  const rule = ruleByItem.get(item.id);
                  const released = rule?.isReleased ?? false;
                  const prog = progressByItem.get(item.id);
                  const completed = prog?.status === "completed";
                  const inProgress = prog?.status === "in_progress";

                  // Gate by release rule server-side. Hidden entirely if teacher
                  // disabled showLockedContent and the lesson isn't released.
                  if (!released && !cls.showLockedContent) return null;

                  if (!released) {
                    return (
                      <li
                        key={item.id}
                        className="flex items-center gap-3 px-5 py-3.5 opacity-60"
                      >
                        <div className="w-8 h-8 rounded-full bg-surface-raised border border-border flex items-center justify-center flex-shrink-0">
                          <Lock className="w-3.5 h-3.5 text-text-muted" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-text-muted truncate">
                            Part {item.seerahPart.partNumber}: {item.seerahPart.title}
                          </p>
                          <p className="text-xs text-text-muted">
                            {rule?.releaseMode === "scheduled" && rule.scheduledAt
                              ? `Releases ${new Date(rule.scheduledAt).toLocaleDateString()}`
                              : "Not yet released"}
                          </p>
                        </div>
                        <StatusBadge
                          status={rule?.releaseMode === "scheduled" ? "scheduled" : "locked"}
                        />
                      </li>
                    );
                  }

                  return (
                    <li key={item.id}>
                      <Link
                        href={`/student/classes/${classId}/lesson/${item.seerahPart.partNumber}`}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-raised transition-colors group"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${
                            completed
                              ? "bg-success/15 border-success/30"
                              : inProgress
                              ? "bg-gold/15 border-gold/30"
                              : "bg-gold/5 border-gold/20"
                          }`}
                        >
                          {completed ? (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          ) : inProgress ? (
                            <Play className="w-3.5 h-3.5 text-gold" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5 text-gold/70" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-text group-hover:text-gold transition-colors truncate">
                            Part {item.seerahPart.partNumber}: {item.seerahPart.title}
                          </p>
                          {item.seerahPart.subtitle && (
                            <p className="text-xs text-text-muted truncate">
                              {item.seerahPart.subtitle}
                            </p>
                          )}
                        </div>
                        <StatusBadge
                          status={completed ? "completed" : inProgress ? "in_progress" : "available"}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
