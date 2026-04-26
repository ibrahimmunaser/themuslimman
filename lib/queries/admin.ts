import "server-only";
import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/roles";

export async function getAdminDashboardData() {
  const [
    totalStudents,
    activeStudents,
    totalPrograms,
    activePrograms,
    totalEnrollments,
    quizStats,
    recentSignups,
    completionStats,
  ] = await Promise.all([
    // Total students
    prisma.user.count({ where: { role: ROLES.STUDENT } }),
    
    // Active students (logged in within last 30 days)
    prisma.user.count({
      where: {
        role: ROLES.STUDENT,
        lastLoginAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    
    // Total programs (classes renamed conceptually)
    prisma.class.count(),
    
    // Active programs
    prisma.class.count({ where: { status: "active" } }),
    
    // Total enrollments
    prisma.classEnrollment.count({ where: { status: "active" } }),
    
    // Quiz performance
    prisma.quizAttempt.aggregate({
      where: { status: "submitted" },
      _avg: { score: true },
      _count: true,
    }),
    
    // Recent student signups (students only)
    prisma.user.findMany({
      where: { role: ROLES.STUDENT },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, fullName: true, email: true, role: true, createdAt: true, lastLoginAt: true },
    }),
    
    // Course completion stats
    prisma.studentProgress.aggregate({
      where: { status: "completed" },
      _count: true,
    }),
  ]);

  return {
    totalStudents,
    activeStudents,
    totalPrograms,
    activePrograms,
    totalEnrollments,
    quizStats,
    recentSignups,
    completionStats,
  };
}
