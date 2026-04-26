"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Trophy, Tag } from "lucide-react";
import type { Quiz, QuizQuestion } from "@/lib/types";

interface QuizViewerProps {
  quiz: Quiz;
}

type AnswerState = "unanswered" | "correct" | "wrong";

interface QuestionResult {
  question: QuizQuestion;
  chosen: string;
  correct: boolean;
}

function QuestionCard({
  question,
  index,
  total,
  onAnswer,
}: {
  question: QuizQuestion;
  index: number;
  total: number;
  onAnswer: (chosen: string, correct: boolean) => void;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  const answered = chosen !== null;

  const handleSelect = (option: string) => {
    if (answered) return;
    setChosen(option);
    onAnswer(option, option === question.correct_answer);
  };

  const getOptionState = (option: string): AnswerState => {
    if (!answered) return "unanswered";
    if (option === question.correct_answer) return "correct";
    if (option === chosen) return "wrong";
    return "unanswered";
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span className="font-medium text-gold/80">Question {index + 1} of {total}</span>
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={clsx(
                "h-1 rounded-full transition-all",
                i < index ? "bg-gold/40 w-4" :
                i === index ? "bg-gold w-6" :
                "bg-border w-4"
              )}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <p className="text-base font-medium text-text leading-relaxed">
        {question.question}
      </p>

      {/* Options */}
      <div className="flex flex-col gap-2.5">
        {question.options.map((option, i) => {
          const state = getOptionState(option);
          return (
            <button
              key={i}
              onClick={() => handleSelect(option)}
              disabled={answered}
              className={clsx(
                "flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-xl border transition-all text-sm",
                !answered && "hover:border-gold/30 hover:bg-gold/5 cursor-pointer",
                answered && "cursor-default",
                state === "unanswered" && "border-border bg-surface text-text",
                state === "correct" && "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
                state === "wrong" && "border-red-500/40 bg-red-500/8 text-red-400",
              )}
            >
              <span className={clsx(
                "flex-shrink-0 w-6 h-6 rounded-full border text-xs font-semibold flex items-center justify-center transition-colors",
                state === "unanswered" && "border-border text-text-muted",
                state === "correct" && "border-emerald-500/60 text-emerald-400",
                state === "wrong" && "border-red-500/50 text-red-400",
              )}>
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1 leading-snug">{option}</span>
              {state === "correct" && <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />}
              {state === "wrong" && <XCircle className="w-4 h-4 flex-shrink-0 text-red-400" />}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {answered && (
        <div className={clsx(
          "rounded-xl border px-4 py-3.5 text-sm leading-relaxed",
          chosen === question.correct_answer
            ? "border-emerald-500/25 bg-emerald-500/8 text-emerald-300"
            : "border-red-500/25 bg-red-500/8 text-red-300"
        )}>
          <p className="font-semibold mb-1">
            {chosen === question.correct_answer ? "Correct!" : `Correct answer: ${question.correct_answer}`}
          </p>
          <p className="text-text-secondary">{question.explanation}</p>
          {question.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              <Tag className="w-3 h-3 text-text-muted mt-0.5 flex-shrink-0" />
              {question.tags.map((tag) => (
                <span key={tag} className="text-xs text-text-muted bg-surface-raised border border-border px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreScreen({
  results,
  total,
  onRetry,
}: {
  results: QuestionResult[];
  total: number;
  onRetry: () => void;
}) {
  const score = results.filter((r) => r.correct).length;
  const pct = Math.round((score / total) * 100);

  const grade =
    pct === 100 ? { label: "Perfect!", color: "text-gold" } :
    pct >= 80   ? { label: "Excellent", color: "text-emerald-400" } :
    pct >= 60   ? { label: "Good", color: "text-blue-400" } :
    pct >= 40   ? { label: "Keep going", color: "text-amber-400" } :
                  { label: "Keep studying", color: "text-red-400" };

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Trophy */}
      <div className="w-20 h-20 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
        <Trophy className="w-9 h-9 text-gold" />
      </div>

      {/* Score */}
      <div className="text-center">
        <p className={clsx("text-4xl font-bold tabular-nums", grade.color)}>{pct}%</p>
        <p className={clsx("text-base font-semibold mt-1", grade.color)}>{grade.label}</p>
        <p className="text-sm text-text-secondary mt-1">{score} / {total} correct</p>
      </div>

      {/* Per-question summary */}
      <div className="w-full flex flex-col gap-2">
        {results.map((r, i) => (
          <div
            key={i}
            className={clsx(
              "flex items-start gap-3 px-4 py-3 rounded-xl border text-sm",
              r.correct
                ? "border-emerald-500/20 bg-emerald-500/6"
                : "border-red-500/20 bg-red-500/6"
            )}
          >
            {r.correct
              ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <p className="text-text leading-snug">{r.question.question}</p>
              {!r.correct && (
                <p className="text-xs text-text-muted mt-1">
                  Your answer: <span className="text-red-400">{r.chosen}</span>
                  {" · "}Correct: <span className="text-emerald-400">{r.question.correct_answer}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Retry */}
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold/15 border border-gold/25 text-gold text-sm font-semibold hover:bg-gold/20 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Retake Quiz
      </button>
    </div>
  );
}

export function QuizViewer({ quiz }: QuizViewerProps) {
  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [pendingResult, setPendingResult] = useState<QuestionResult | null>(null);
  const [done, setDone] = useState(false);

  const handleAnswer = (chosen: string, correct: boolean) => {
    setPendingResult({ question: quiz.questions[current], chosen, correct });
  };

  const handleNext = () => {
    if (!pendingResult) return;
    const updated = [...results, pendingResult];
    setPendingResult(null);
    if (current + 1 >= quiz.questions.length) {
      setResults(updated);
      setDone(true);
    } else {
      setResults(updated);
      setCurrent((c) => c + 1);
    }
  };

  const handleRetry = () => {
    setCurrent(0);
    setResults([]);
    setPendingResult(null);
    setDone(false);
  };

  if (done) {
    return (
      <ScoreScreen
        results={results}
        total={quiz.questions.length}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <QuestionCard
        key={current}
        question={quiz.questions[current]}
        index={current}
        total={quiz.questions.length}
        onAnswer={handleAnswer}
      />

      {pendingResult && (
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-ink text-sm font-semibold hover:bg-gold-light transition-colors"
          >
            {current + 1 >= quiz.questions.length ? "See Results" : "Next Question"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
