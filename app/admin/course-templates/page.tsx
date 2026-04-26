import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderTree } from "lucide-react";

export const metadata = { title: "Course Templates" };
export const dynamic = "force-dynamic";

export default async function AdminCourseTemplatesPage() {
  await requireAdmin();
  const templates = await prisma.courseTemplate.findMany({
    include: { _count: { select: { items: true, classCourses: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-text mb-1">Course Templates</h1>
      <p className="text-text-secondary text-sm mb-6">
        Reusable curriculum templates teachers can clone into a class.
      </p>

      {templates.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No templates yet"
          description="Create a template to give teachers a head start."
        />
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="p-5 rounded-2xl border border-border bg-surface">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-text">{t.title}</p>
                  {t.description && (
                    <p className="text-sm text-text-secondary mt-1">{t.description}</p>
                  )}
                </div>
                <div className="text-right text-xs text-text-muted">
                  <p>{t._count.items} parts</p>
                  <p>{t._count.classCourses} classes using</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
