"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireStudent } from "@/lib/auth";

// ─────────────────────────────────────────────────────────────
// Join a class by code
// ─────────────────────────────────────────────────────────────

export async function joinClassByCode(
  code: string
): Promise<{ success: boolean; error?: string; classId?: string }> {
  const user = await requireStudent();
  if (!user.studentProfileId) return { success: false, error: "Student profile required." };

  const normalized = code.trim().toLowerCase();
  if (!normalized) return { success: false, error: "Enter a class code." };

  // Look up by slug (the slug is the unique identifier for a class)
  const cls = await prisma.class.findUnique({ where: { slug: normalized } });
  if (!cls) return { success: false, error: "No class matches that code." };
  if (cls.status === "archived") return { success: false, error: "This class is archived." };

  const existing = await prisma.classEnrollment.findUnique({
    where: { classId_studentId: { classId: cls.id, studentId: user.studentProfileId } },
  });

  if (existing && existing.status === "active") {
    return { success: true, classId: cls.id };
  }

  await prisma.classEnrollment.upsert({
    where: { classId_studentId: { classId: cls.id, studentId: user.studentProfileId } },
    create: { classId: cls.id, studentId: user.studentProfileId, status: "active" },
    update: { status: "active", removedAt: null, joinedAt: new Date() },
  });

  revalidatePath("/student/dashboard");
  revalidatePath("/student/classes");
  return { success: true, classId: cls.id };
}

// ─────────────────────────────────────────────────────────────
// Mark a lesson complete
// ─────────────────────────────────────────────────────────────

export async function markItemComplete(
  classId: string,
  classCourseItemId: string
): Promise<{ success: boolean; error?: string }> {
  const user = await requireStudent();
  if (!user.studentProfileId) return { success: false, error: "Student profile required." };

  const enrollment = await prisma.classEnrollment.findUnique({
    where: { classId_studentId: { classId, studentId: user.studentProfileId } },
  });
  if (!enrollment || enrollment.status !== "active") {
    return { success: false, error: "You are not enrolled in this class." };
  }

  await prisma.studentProgress.upsert({
    where: {
      studentId_classCourseItemId: {
        studentId: user.studentProfileId,
        classCourseItemId,
      },
    },
    create: {
      classId,
      studentId: user.studentProfileId,
      classCourseItemId,
      status: "completed",
      completionPercentage: 100,
      startedAt: new Date(),
      completedAt: new Date(),
      lastAccessedAt: new Date(),
    },
    update: {
      status: "completed",
      completionPercentage: 100,
      completedAt: new Date(),
      lastAccessedAt: new Date(),
    },
  });

  revalidatePath(`/student/classes/${classId}`);
  revalidatePath("/student/dashboard");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// Quiz flow
// ─────────────────────────────────────────────────────────────

export async function startOrResumeQuiz(
  classId: string,
  quizId: string
): Promise<{ success: boolean; error?: string; attemptId?: string }> {
  const user = await requireStudent();
  if (!user.studentProfileId) return { success: false, error: "Student profile required." };

  // Verify enrollment
  const enrollment = await prisma.classEnrollment.findUnique({
    where: { classId_studentId: { classId, studentId: user.studentProfileId } },
  });
  if (!enrollment || enrollment.status !== "active") {
    return { success: false, error: "Not enrolled in this class." };
  }

  // Verify quiz exists and is active for this class
  const quiz = await prisma.quiz.findFirst({ where: { id: quizId, classId, isActive: true } });
  if (!quiz) return { success: false, error: "Quiz not available." };

  // Check for an in-progress attempt
  const inProgress = await prisma.quizAttempt.findFirst({
    where: { quizId, studentId: user.studentProfileId, status: "in_progress" },
    orderBy: { startedAt: "desc" },
  });
  if (inProgress) return { success: true, attemptId: inProgress.id };

  // Check attempt limit
  if (quiz.maxAttempts) {
    const attemptCount = await prisma.quizAttempt.count({
      where: { quizId, studentId: user.studentProfileId, status: "submitted" },
    });
    if (attemptCount >= quiz.maxAttempts) {
      return { success: false, error: `Max attempts (${quiz.maxAttempts}) reached.` };
    }
  }

  // Create a new attempt
  const attempt = await prisma.quizAttempt.create({
    data: { quizId, classId, studentId: user.studentProfileId, status: "in_progress" },
  });

  return { success: true, attemptId: attempt.id };
}

export async function submitQuizAttempt(
  attemptId: string,
  answers: { questionId: string; selectedOptionId?: string; answerText?: string }[]
): Promise<{ success: boolean; error?: string; score?: number; passed?: boolean; total?: number }> {
  const user = await requireStudent();
  if (!user.studentProfileId) return { success: false, error: "Student profile required." };

  const attempt = await prisma.quizAttempt.findFirst({
    where: { id: attemptId, studentId: user.studentProfileId, status: "in_progress" },
    include: { quiz: { include: { questions: { include: { options: true } } } } },
  });
  if (!attempt) return { success: false, error: "Attempt not found or already submitted." };

  const total = attempt.quiz.questions.length;
  let correct = 0;

  const answerCreates = answers.map((a) => {
    const question = attempt.quiz.questions.find((q) => q.id === a.questionId);
    let isCorrect: boolean | null = null;
    if (a.selectedOptionId && question) {
      const option = question.options.find((o) => o.id === a.selectedOptionId);
      isCorrect = option?.isCorrect ?? false;
      if (isCorrect) correct++;
    }
    return {
      quizAttemptId: attemptId,
      questionId: a.questionId,
      selectedOptionId: a.selectedOptionId ?? null,
      answerText: a.answerText ?? null,
      isCorrect,
    };
  });

  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = score >= attempt.quiz.passingScore;

  await prisma.$transaction([
    prisma.quizAnswer.createMany({ data: answerCreates }),
    prisma.quizAttempt.update({
      where: { id: attemptId },
      data: { status: "submitted", submittedAt: new Date(), score, passed },
    }),
  ]);

  revalidatePath(`/student/classes/${attempt.classId ?? ""}/quiz/${attempt.quizId}`);
  revalidatePath(`/student/classes/${attempt.classId ?? ""}`);
  return { success: true, score, passed, total };
}
