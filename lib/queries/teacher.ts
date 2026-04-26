import "server-only";
import { prisma } from "@/lib/db";

export async function getTeacherDashboardData(teacherProfileId: string) {
  const [classes, totalStudents, totalReleased, avgScoreAgg, recentAnnouncements] = await Promise.all([
    prisma.class.findMany({
      where: { teacherId: teacherProfileId, status: { not: "archived" } },
      include: {
        _count: { select: { enrollments: true } },
        classCourse: {
          include: {
            items: { select: { id: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.classEnrollment.count({
      where: { class: { teacherId: teacherProfileId }, status: "active" },
    }),
    prisma.releaseRule.count({
      where: {
        class: { teacherId: teacherProfileId },
        isReleased: true,
        releasedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.quizAttempt.aggregate({
      where: { class: { teacherId: teacherProfileId }, status: "submitted" },
      _avg: { score: true },
      _count: true,
    }),
    prisma.announcement.findMany({
      where: { class: { teacherId: teacherProfileId }, isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 5,
      include: { class: { select: { title: true, id: true } } },
    }),
  ]);

  return {
    classes,
    totalClasses: classes.length,
    totalStudents,
    releasedThisWeek: totalReleased,
    averageQuizScore: avgScoreAgg._avg.score,
    totalQuizAttempts: avgScoreAgg._count,
    recentAnnouncements,
  };
}

export async function getTeacherClasses(teacherProfileId: string) {
  return prisma.class.findMany({
    where: { teacherId: teacherProfileId },
    include: {
      _count: { select: { enrollments: true, announcements: true } },
      classCourse: {
        include: {
          items: { select: { id: true } },
        },
      },
      releaseRules: {
        where: { isReleased: true },
        select: { id: true },
      },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
}

export async function getTeacherClassDetail(teacherProfileId: string, classId: string) {
  return prisma.class.findFirst({
    where: { id: classId, teacherId: teacherProfileId },
    include: {
      enrollments: {
        where: { status: "active" },
        include: {
          student: { include: { user: { select: { id: true, fullName: true, email: true } } } },
        },
        orderBy: { joinedAt: "asc" },
      },
      classCourse: {
        include: {
          items: {
            include: { seerahPart: true },
            orderBy: { itemOrder: "asc" },
          },
        },
      },
      releaseRules: true,
      announcements: {
        orderBy: { publishedAt: "desc" },
        take: 10,
      },
      quizzes: { include: { _count: { select: { questions: true, attempts: true } } } },
      exams: true,
    },
  });
}

export async function getClassForTeacher(teacherProfileId: string, classId: string) {
  return prisma.class.findFirst({
    where: { id: classId, teacherId: teacherProfileId },
    select: { id: true, title: true, status: true, joinCode: true, lockSequence: true, showLockedContent: true },
  });
}

export async function getClassCurriculumData(teacherProfileId: string, classId: string) {
  const cls = await prisma.class.findFirst({
    where: { id: classId, teacherId: teacherProfileId },
    include: {
      classCourse: {
        include: {
          items: {
            include: { seerahPart: { select: { id: true, partNumber: true, title: true, subtitle: true, era: true } } },
            orderBy: { itemOrder: "asc" },
          },
        },
      },
    },
  });
  if (!cls) return null;

  const allParts = await prisma.seerahPart.findMany({
    where: { isPublished: true },
    orderBy: { partNumber: "asc" },
    select: { id: true, partNumber: true, title: true, subtitle: true, era: true },
  });

  const addedIds = new Set(cls.classCourse?.items.map((i) => i.seerahPartId) ?? []);
  return { cls, allParts, addedIds };
}

export async function getClassReleasesData(teacherProfileId: string, classId: string) {
  return prisma.class.findFirst({
    where: { id: classId, teacherId: teacherProfileId },
    include: {
      classCourse: {
        include: {
          items: {
            include: { seerahPart: { select: { partNumber: true, title: true } } },
            orderBy: { itemOrder: "asc" },
          },
        },
      },
      releaseRules: { where: { targetType: "lesson" } },
    },
  });
}

export async function getClassProgressData(teacherProfileId: string, classId: string) {
  const cls = await prisma.class.findFirst({
    where: { id: classId, teacherId: teacherProfileId },
    include: {
      classCourse: {
        include: { items: { select: { id: true }, orderBy: { itemOrder: "asc" } } },
      },
      enrollments: {
        where: { status: "active" },
        include: {
          student: {
            include: {
              user: { select: { fullName: true, email: true } },
              progress: { where: { classId } },
              quizAttempts: {
                where: { classId, status: "submitted" },
                select: { score: true, passed: true, submittedAt: true },
              },
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
  });
  return cls;
}

export async function getClassQuizzesData(teacherProfileId: string, classId: string) {
  const cls = await prisma.class.findFirst({
    where: { id: classId, teacherId: teacherProfileId },
    select: { id: true, title: true },
  });
  if (!cls) return null;
  const quizzes = await prisma.quiz.findMany({
    where: { classId },
    include: {
      seerahPart: { select: { partNumber: true, title: true } },
      _count: { select: { questions: true, attempts: true } },
      attempts: { where: { status: "submitted" }, select: { score: true, passed: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  return { cls, quizzes };
}

export async function getClassExamsData(teacherProfileId: string, classId: string) {
  const cls = await prisma.class.findFirst({
    where: { id: classId, teacherId: teacherProfileId },
    select: { id: true, title: true },
  });
  if (!cls) return null;
  const exams = await prisma.exam.findMany({
    where: { classId },
    include: {
      partLinks: { include: { seerahPart: { select: { partNumber: true, title: true } } } },
      _count: { select: { attempts: true } },
      attempts: { where: { status: "submitted" }, select: { score: true, passed: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  return { cls, exams };
}

export async function getTeacherAllAssessments(teacherProfileId: string) {
  const classes = await prisma.class.findMany({
    where: { teacherId: teacherProfileId },
    select: {
      id:    true,
      title: true,
      quizzes: {
        include: {
          seerahPart: { select: { partNumber: true, title: true } },
          _count:     { select: { questions: true, attempts: true } },
          attempts:   { where: { status: "submitted" }, select: { score: true, passed: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      exams: {
        include: {
          partLinks: { include: { seerahPart: { select: { partNumber: true, title: true } } } },
          _count:    { select: { attempts: true } },
          attempts:  { where: { status: "submitted" }, select: { score: true, passed: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return classes;
}
