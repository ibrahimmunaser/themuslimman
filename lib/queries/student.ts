import "server-only";
import { prisma } from "@/lib/db";

export async function getStudentDashboardData(studentProfileId: string) {
  const [enrollments, recentAnnouncements, recentProgress] = await Promise.all([
    prisma.classEnrollment.findMany({
      where: { studentId: studentProfileId, status: "active" },
      include: {
        class: {
          include: {
            teacher: { include: { user: { select: { fullName: true } } } },
            classCourse: {
              include: {
                items: { select: { id: true } },
              },
            },
            releaseRules: { where: { isReleased: true }, select: { id: true, classCourseItemId: true } },
            _count: { select: { enrollments: true } },
          },
        },
      },
    }),
    prisma.announcement.findMany({
      where: {
        isPublished: true,
        class: { enrollments: { some: { studentId: studentProfileId, status: "active" } } },
      },
      include: { class: { select: { id: true, title: true } } },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
    prisma.studentProgress.findMany({
      where: { studentId: studentProfileId },
      include: {
        classCourseItem: { include: { seerahPart: true } },
        class: { select: { id: true, title: true } },
      },
      orderBy: { lastAccessedAt: "desc" },
      take: 5,
    }),
  ]);

  return { enrollments, recentAnnouncements, recentProgress };
}

export async function getStudentClassView(studentProfileId: string, classId: string) {
  const enrollment = await prisma.classEnrollment.findUnique({
    where: { classId_studentId: { classId, studentId: studentProfileId } },
    include: {
      class: {
        include: {
          teacher: { include: { user: { select: { fullName: true } } } },
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
            where: { isPublished: true },
            orderBy: { publishedAt: "desc" },
            take: 5,
          },
        },
      },
    },
  });

  if (!enrollment || enrollment.status !== "active") return null;

  const progress = await prisma.studentProgress.findMany({
    where: { studentId: studentProfileId, classId },
  });
  const progressByItem = new Map(progress.map((p) => [p.classCourseItemId, p]));

  return { enrollment, progressByItem };
}

export async function getStudentLessonData(
  studentProfileId: string,
  classId: string,
  partNumber: number
) {
  // Must be enrolled
  const enrollment = await prisma.classEnrollment.findUnique({
    where: { classId_studentId: { classId, studentId: studentProfileId } },
    include: { class: { select: { id: true, title: true, showLockedContent: true } } },
  });
  if (!enrollment || enrollment.status !== "active") return null;

  // Find the curriculum item for this part in this class
  const item = await prisma.classCourseItem.findFirst({
    where: {
      seerahPart: { partNumber },
      classCourse: { classId },
    },
    include: {
      seerahPart: true,
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
  if (!item) return null;

  // Server-side gate: must be released
  const rule = item.releaseRules[0];
  const isReleased = rule?.isReleased ?? false;
  if (!isReleased) return { locked: true as const, item, cls: enrollment.class };

  // Fetch quiz for this part (if any) active for this class
  const quiz = await prisma.quiz.findFirst({
    where: { seerahPartId: item.seerahPartId, classId, isActive: true },
    select: { id: true, title: true, passingScore: true },
  });

  // Student progress
  const progress = await prisma.studentProgress.findUnique({
    where: { studentId_classCourseItemId: { studentId: studentProfileId, classCourseItemId: item.id } },
  });

  // Quiz attempts
  const quizAttempts = quiz
    ? await prisma.quizAttempt.findMany({
        where: { quizId: quiz.id, studentId: studentProfileId, status: "submitted" },
        orderBy: { submittedAt: "desc" },
        take: 5,
      })
    : [];

  const items = item.classCourse.items;
  const currentIdx = items.findIndex((i) => i.id === item.id);
  const prevItem = currentIdx > 0 ? items[currentIdx - 1] : null;
  const nextItem = currentIdx < items.length - 1 ? items[currentIdx + 1] : null;

  return {
    locked: false as const,
    item,
    cls: enrollment.class,
    rule,
    progress,
    quiz,
    quizAttempts,
    prevItem,
    nextItem,
  };
}

export async function getStudentQuizData(
  studentProfileId: string,
  classId: string,
  quizId: string
) {
  const enrollment = await prisma.classEnrollment.findUnique({
    where: { classId_studentId: { classId, studentId: studentProfileId } },
  });
  if (!enrollment || enrollment.status !== "active") return null;

  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, classId, isActive: true },
    include: {
      questions: {
        include: { options: { orderBy: { orderIndex: "asc" } } },
        orderBy: { orderIndex: "asc" },
      },
      seerahPart: { select: { partNumber: true, title: true } },
    },
  });
  if (!quiz) return null;

  const previousAttempts = await prisma.quizAttempt.findMany({
    where: { quizId, studentId: studentProfileId, status: "submitted" },
    orderBy: { submittedAt: "desc" },
    include: {
      answers: {
        include: {
          question: { select: { questionText: true } },
          selectedOption: { select: { optionText: true, isCorrect: true } },
        },
      },
    },
  });

  const activeAttempt = await prisma.quizAttempt.findFirst({
    where: { quizId, studentId: studentProfileId, status: "in_progress" },
    orderBy: { startedAt: "desc" },
  });

  const attemptsRemaining = quiz.maxAttempts
    ? quiz.maxAttempts - previousAttempts.length
    : null;

  return { quiz, previousAttempts, activeAttempt, attemptsRemaining };
}
