import "server-only";
import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/roles";

export async function getAdminDashboardData() {
  const [
    totalUsers,
    totalTeachers,
    totalStudents,
    totalClasses,
    activeClasses,
    totalEnrollments,
    quizStats,
    recentSignups,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: ROLES.TEACHER } }),
    prisma.user.count({ where: { role: ROLES.STUDENT } }),
    prisma.class.count(),
    prisma.class.count({ where: { status: "active" } }),
    prisma.classEnrollment.count({ where: { status: "active" } }),
    prisma.quizAttempt.aggregate({
      where: { status: "submitted" },
      _avg: { score: true },
      _count: true,
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, fullName: true, email: true, role: true, createdAt: true },
    }),
  ]);

  return {
    totalUsers,
    totalTeachers,
    totalStudents,
    totalClasses,
    activeClasses,
    totalEnrollments,
    quizStats,
    recentSignups,
  };
}
