"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Brain } from "lucide-react";
import { startOrResumeQuiz, submitQuizAttempt } from "@/lib/actions/student";

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  options: { id: string; optionText: string }[];
}

interface Props {
  classId: string;
  quizId: string;
  questions: Question[];
  passingScore: number;
  timeLimitMinutes: number | null;
  existingAttemptId: string | null;
  previousBestScore: number | null;
}

type QuizPhase = "ready" | "taking" | "result";

interface SubmitResult {
  score: number;
  passed: boolean;
  total: number;
}

export function QuizForm({
  classId,
  quizId,
  questions,
  passingScore,
  existingAttemptId,
  previousBestScore,
}: Props) {
  const [phase, setPhase] = useState<QuizPhase>("ready");
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(existingAttemptId);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleStart() {
    startTransition(async () => {
      setError(null);
      const res = await startOrResumeQuiz(classId, quizId);
      if (!res.success || !res.attemptId) {
        setError(res.error ?? "Could not start quiz.");
        return;
      }
      setCurrentAttemptId(res.attemptId);
      setPhase("taking");
    });
  }

  function handleSelect(questionId: string, optionId: string) {
    setAnswers((prev) => new Map(prev).set(questionId, optionId));
  }

  function handleSubmit() {
    if (!currentAttemptId) return;
    startTransition(async () => {
      setError(null);
      const answersArray = questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: answers.get(q.id),
      }));
      const res = await submitQuizAttempt(currentAttemptId, answersArray);
      if (!res.success) {
        setError(res.error ?? "Could not submit.");
        return;
      }
      setResult({ score: res.score!, passed: res.passed!, total: res.total! });
      setPhase("result");
    });
  }

  const answeredCount = answers.size;
  const allAnswered = answeredCount === questions.length;

  if (phase === "ready") {
    return (
      <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-border bg-surface text-center">
        <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-gold" />
        </div>
        <h2 className="text-xl font-bold text-text mb-2">Ready to start?</h2>
        <p className="text-text-secondary text-sm mb-2">
          {questions.length} questions · {passingScore}% to pass
        </p>
        {previousBestScore !== null && (
          <p className={`text-sm mb-4 ${previousBestScore >= passingScore ? "text-success" : "text-error"}`}>
            Your best score: {previousBestScore}%
          </p>
        )}
        {error && <p className="text-sm text-error mb-4">{error}</p>}
        <button
          onClick={handleStart}
          disabled={isPending}
          className="px-6 py-3 rounded-xl bg-gold text-ink text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Starting…" : existingAttemptId ? "Resume quiz" : "Start quiz"}
        </button>
      </div>
    );
  }

  if (phase === "result" && result) {
    return (
      <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-border bg-surface text-center">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${
            result.passed
              ? "bg-success/15 border-success/30"
              : "bg-error/15 border-error/30"
          }`}
        >
          {result.passed ? (
            <CheckCircle2 className="w-8 h-8 text-success" />
          ) : (
            <XCircle className="w-8 h-8 text-error" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-text mb-1">
          {result.passed ? "Well done!" : "Keep going!"}
        </h2>
        <p className="text-4xl font-bold mt-3 mb-1 tabular-nums">
          <span className={result.passed ? "text-success" : "text-error"}>{result.score}%</span>
        </p>
        <p className="text-sm text-text-secondary mb-6">
          {result.passed ? "You passed." : `Need ${passingScore}% to pass.`}{" "}
          Answered {answeredCount} of {result.total} questions.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => {
              setPhase("ready");
              setAnswers(new Map());
              setCurrentAttemptId(null);
              setResult(null);
            }}
            className="px-5 py-2.5 rounded-xl border border-border text-text-muted text-sm hover:text-text transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => router.push(`/student/classes/${classId}`)}
            className="px-5 py-2.5 rounded-xl bg-gold/10 border border-gold/30 text-gold text-sm font-medium hover:bg-gold/20 transition-colors"
          >
            Back to class
          </button>
        </div>
      </div>
    );
  }

  // Taking the quiz
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-text-muted">
          {answeredCount} of {questions.length} answered
        </p>
        <div className="w-32 h-1.5 bg-surface-raised rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {questions.map((q, idx) => (
        <div key={q.id} className="p-5 rounded-2xl border border-border bg-surface">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-3">
            Question {idx + 1}
          </p>
          <p className="text-text font-medium mb-4 leading-relaxed">{q.questionText}</p>
          {q.options.length > 0 ? (
            <div className="space-y-2">
              {q.options.map((opt) => {
                const selected = answers.get(q.id) === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(q.id, opt.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                      selected
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-border bg-surface-raised/50 text-text hover:border-gold/30 hover:bg-gold/5"
                    }`}
                  >
                    {opt.optionText}
                  </button>
                );
              })}
            </div>
          ) : (
            <textarea
              className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-sm text-text focus:outline-none focus:border-gold/50 resize-none"
              rows={3}
              placeholder="Your answer…"
              value={answers.get(q.id) ?? ""}
              onChange={(e) =>
                setAnswers((prev) => new Map(prev).set(q.id, e.target.value))
              }
            />
          )}
        </div>
      ))}

      {error && <p className="text-sm text-error text-center">{error}</p>}

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => router.push(`/student/classes/${classId}`)}
          className="text-sm text-text-muted hover:text-text transition-colors"
        >
          Save and exit
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending || !allAnswered}
          className="px-6 py-2.5 rounded-xl bg-gold text-ink text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Submitting…" : "Submit quiz"}
        </button>
      </div>
    </div>
  );
}
