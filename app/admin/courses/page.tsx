import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { BookOpen, Plus } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Courses" };
export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  await requireAdmin();
  
  // Courses are platform-owned curriculum products
  // Using course templates as the foundation
  const courses = await prisma.courseTemplate.findMany({
    where: { isActive: true },
    include: { 
      _count: { select: { items: true, classCourses: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text mb-1">Courses</h1>
            <p className="text-text-secondary text-sm">
              Platform-owned curriculum products offered to students.
            </p>
          </div>
          {/* Add course button for future */}
          <button
            disabled
            className="px-4 py-2 rounded-lg bg-gold/10 text-gold border border-gold/30 text-sm font-medium opacity-50 cursor-not-allowed"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Add Course
          </button>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-border bg-surface">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-text-muted">No courses yet</p>
          <p className="text-sm text-text-secondary mt-1">
            Courses like "Full Seerah — All 100 Parts" will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="p-6 rounded-2xl border border-border bg-surface hover:border-gold/30 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-5 h-5 text-gold" />
                    <h3 className="text-lg font-semibold text-text">{course.title}</h3>
                  </div>
                  {course.description && (
                    <p className="text-sm text-text-secondary mb-3">{course.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span>{course._count.items} lessons</span>
                    <span>•</span>
                    <span>Used in {course._count.classCourses} programs</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    Published
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info box */}
      <div className="mt-8 p-4 rounded-xl bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-900 font-medium mb-1">About Courses</p>
        <p className="text-xs text-blue-700">
          Courses are the core curriculum products (like "Full Seerah" or future courses). 
          Programs use courses as their curriculum and add scheduling, enrollment, and delivery rules.
        </p>
      </div>
    </div>
  );
}
