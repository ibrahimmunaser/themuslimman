import { notFound } from "next/navigation";
import Link from "next/link";
import { requireStudent } from "@/lib/auth";
import { getStudentQuizData } from "@/lib/queries/student";
import { ArrowLeft, Clock, Brain } from "lucide-react";
import { QuizForm } from "./quiz-form";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ classId: string; quizId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { quizId } = await params;
  return { title: `Quiz — ${quizId}` };
}

export default async function StudentQuizPage({ params }: Props) {
  const user = await requireStudent();
  if (!user.studentProfileId) notFound();

  const { classId, quizId } = await params;
  const data = await getStudentQuizData(user.studentProfileId, classId, quizId);

  if (!data) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <div className="w-14 h-14 rounded-2xl bg-surface-raised border border-border flex items-center justify-center mx-auto mb-4">
          <Brain className="w-7 h-7 text-text-muted" />
        </div>
        <h1 className="text-xl font-bold text-text mb-2">Quiz not available</h1>
        <p className="text-text-secondary text-sm mb-6">
          This quiz is locked or not yet available. Check back when your teacher unlocks it.
        </p>
        <Link
          href={`/student/classes/${classId}`}
          className="inline-flex items-center gap-1.5 text-gold hover:text-gold/70 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to class
        </Link>
      </div>
    );
  }

  const { quiz, previousAttempts, activeAttempt, attemptsRemaining } = data;

  const previousBestScore =
    previousAttempts.length > 0
      ? Math.max(...previousAttempts.map((a) => a.score ?? 0))
      : null;

  const canAttempt = attemptsRemaining === null || attemptsRemaining > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/student/classes/${classId}`}
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to class
        </Link>

        {/* Quiz header */}
        <div className="mb-6 p-5 rounded-2xl border border-border bg-surface">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-gold" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-text">{quiz.title}</h1>
              {quiz.seerahPart && (
                <p className="text-sm text-text-secondary mt-0.5">
                  Part {quiz.seerahPart.partNumber}: {quiz.seerahPart.title}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <span className="text-xs text-text-muted">
                  {quiz.questions.length} questions
                </span>
                <span className="text-xs text-text-muted">
                  Passing: {quiz.passingScore}%
                </span>
                {quiz.timeLimitMinutes && (
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {quiz.timeLimitMinutes} min
                  </span>
                )}
                {attemptsRemaining !== null && (
                  <span className="text-xs text-text-muted">
                    {attemptsRemaining} attempt{attemptsRemaining !== 1 ? "s" : ""} left
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Previous attempts summary */}
        {previousAttempts.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
              Previous attempts
            </p>
            <div className="space-y-2">
              {previousAttempts.slice(0, 3).map((attempt, idx) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-surface"
                >
                  <span className="text-sm text-text-muted">Attempt {previousAttempts.length - idx}</span>
                  <div className="flex items-center gap-3">
                    {attempt.submittedAt && (
                      <span className="text-xs text-text-muted">
                        {new Date(attempt.submittedAt).toLocaleDateString()}
                      </span>
                    )}
                    <span
                      className={`text-sm font-semibold tabular-nums ${
                        (attempt.score ?? 0) >= quiz.passingScore ? "text-success" : "text-error"
                      }`}
                    >
                      {attempt.score ?? 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {canAttempt ? (
          <QuizForm
            classId={classId}
            quizId={quizId}
            questions={quiz.questions.map((q) => ({
              id: q.id,
              questionText: q.questionText,
              questionType: q.questionType,
              options: q.options.map((o) => ({ id: o.id, optionText: o.optionText })),
            }))}
            passingScore={quiz.passingScore}
            timeLimitMinutes={quiz.timeLimitMinutes}
            existingAttemptId={activeAttempt?.id ?? null}
            previousBestScore={previousBestScore}
          />
        ) : (
          <div className="p-6 rounded-2xl border border-border bg-surface text-center">
            <p className="text-text font-medium mb-2">Maximum attempts reached</p>
            <p className="text-text-secondary text-sm">
              You&apos;ve used all {quiz.maxAttempts} attempt{quiz.maxAttempts !== 1 ? "s" : ""}.
              {previousBestScore !== null && ` Your best score was ${previousBestScore}%.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
