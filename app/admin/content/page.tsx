import { Plus, FolderOpen } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CourseFolder } from "./course-folder";

export const metadata = { title: "Content Library" };
export const dynamic  = "force-dynamic";

export default async function AdminContentPage() {
  await requireAdmin();

  // Load all active courses with their parts in order
  const courses = await prisma.courseTemplate.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    include: {
      items: {
        orderBy: { itemOrder: "asc" },
        include: {
          seerahPart: {
            select: {
              id: true,
              partNumber: true,
              title: true,
              era: true,
              includedInEssentials: true,
              isPublished: true,
            },
          },
        },
      },
    },
  });

  // Parts that don't belong to any course template (orphans)
  const allPartIds = new Set(
    courses.flatMap((c) => c.items.map((i) => i.seerahPartId))
  );
  const orphanParts = await prisma.seerahPart.findMany({
    where: { id: { notIn: allPartIds.size > 0 ? [...allPartIds] : ["__none__"] } },
    orderBy: { partNumber: "asc" },
    select: {
      id: true, partNumber: true, title: true, era: true,
      includedInEssentials: true, isPublished: true,
    },
  });

  const totalParts   = courses.reduce((n, c) => n + c.items.length, 0) + orphanParts.length;
  const totalCourses = courses.length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-1">Content Library</h1>
          <p className="text-text-secondary text-sm">
            {totalCourses} {totalCourses === 1 ? "course" : "courses"} · {totalParts} total parts
          </p>
        </div>
        {/* Placeholder for future "Add Course" action */}
        <button
          type="button"
          disabled
          title="Coming soon"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-border text-text-muted text-sm font-medium opacity-60 cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      {/* Course folders */}
      {courses.length === 0 && orphanParts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <FolderOpen className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary text-sm">No courses yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <CourseFolder
              key={course.id}
              courseId={course.id}
              title={course.title}
              description={course.description}
              parts={course.items.map((item) => item.seerahPart)}
              defaultOpen={true}
            />
          ))}

          {/* Uncategorised parts (edge case: parts not linked to any template) */}
          {orphanParts.length > 0 && (
            <CourseFolder
              courseId="__orphans__"
              title="Uncategorised Parts"
              description="Parts not yet assigned to a course."
              parts={orphanParts}
              defaultOpen={false}
            />
          )}
        </div>
      )}
    </div>
  );
}
