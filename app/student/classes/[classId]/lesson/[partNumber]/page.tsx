import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireStudent } from "@/lib/auth";
import { getStudentLessonData } from "@/lib/queries/student";
import { getPartById } from "@/lib/content";
import { ERA_MAP } from "@/lib/types";
import {
  readBriefing,
  readStatementOfFacts,
  readStudyGuide,
  readReport,
  getSlideFiles,
  getInfographicFilename,
  mindmapExists,
  readQuiz,
  readFlashcards,
} from "@/lib/files";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  Lock,
  Brain,
} from "lucide-react";
import { PartTabs } from "@/components/part/part-tabs";
import { MarkCompleteButton } from "./mark-complete-button";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ classId: string; partNumber: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { partNumber } = await params;
  const num = parseInt(partNumber, 10);
  const part = getPartById(`part-${num}`);
  return { title: part ? `Part ${num}: ${part.title}` : "Lesson" };
}

export default async function StudentLessonPage({ params }: Props) {
  const user = await requireStudent();
  if (!user.studentProfileId) notFound();

  const { classId, partNumber: partNumberStr } = await params;
  const partNum = parseInt(partNumberStr, 10);
  if (isNaN(partNum)) notFound();

  const data = await getStudentLessonData(user.studentProfileId, classId, partNum);
  if (!data) notFound();

  if (data.locked) {
    // Server-side gate: lesson not released, redirect back to class view
    redirect(`/student/classes/${classId}`);
  }

  const { item, cls, progress, quiz, quizAttempts, prevItem, nextItem } = data;
  const partBase = getPartById(`part-${partNum}`);
  if (!partBase) notFound();

  const n = partBase.partNumber;
  const slideFiles = {
    presented: getSlideFiles(n, "presented").map((p) => `/seerah-media/${p}`),
    detailed: getSlideFiles(n, "detailed").map((p) => `/seerah-media/${p}`),
    facts: getSlideFiles(n, "facts").map((p) => `/seerah-media/${p}`),
  };
  const infConcise = getInfographicFilename(n, "Concise");
  const infStandard = getInfographicFilename(n, "Standard");
  const infBento = getInfographicFilename(n, "Bento Grid");

  const part = {
    ...partBase,
    assets: {
      ...partBase.assets,
      briefingText: readBriefing(n) ?? undefined,
      statementOfFactsText: readStatementOfFacts(n) ?? undefined,
      studyGuideText: readStudyGuide(n) ?? undefined,
      reportText: readReport(n) ?? undefined,
      mindmapUrl: mindmapExists(n) ? `/seerah-media/Mindmaps/Part ${n} - Mindmap.png` : undefined,
      quiz: readQuiz(n) ?? undefined,
      flashcards: readFlashcards(n) ?? undefined,
      slides: slideFiles,
      infographics: {
        concise: infConcise ? `/seerah-media/Infographics/Concise/${infConcise}` : undefined,
        standard: infStandard ? `/seerah-media/Infographics/Standard/${infStandard}` : undefined,
        bentoGrid: infBento ? `/seerah-media/Infographics/Bento Grid/${infBento}` : undefined,
      },
    },
  };

  const era = ERA_MAP[part.era];
  const isCompleted = progress?.status === "completed";
  const bestScore = quizAttempts.length > 0
    ? Math.max(...quizAttempts.map((a) => a.score ?? 0))
    : null;

  return (
    <div className="min-h-full">
      {/* ── Top bar: back to class + mark complete ─────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link
            href={`/student/classes/${classId}`}
            className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {cls.title}
          </Link>
          <MarkCompleteButton
            classId={classId}
            classCourseItemId={item.id}
            isCompleted={isCompleted}
          />
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 mb-6">
        <div className="rounded-2xl bg-surface border border-border/70 overflow-hidden">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/35 to-transparent" />
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/12 border border-gold/25 text-gold text-xs font-semibold">
                Part {part.partNumber}
              </span>
              {era && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-raised border border-border text-text-secondary text-xs font-medium">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: era.color }}
                  />
                  {era.label}
                </span>
              )}
              {part.duration && (
                <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                  <Clock className="w-3 h-3" />
                  {part.duration}
                </span>
              )}
              {item.moduleName && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-raised border border-border text-text-muted text-xs">
                  {item.moduleName}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text leading-tight tracking-tight">
              {part.title}
            </h1>
            {part.subtitle && (
              <p className="mt-2 text-base sm:text-lg text-text-secondary leading-snug">{part.subtitle}</p>
            )}

            <div className="mt-6 flex gap-4 p-4 sm:p-5 rounded-xl bg-surface-raised border border-border/60">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-gold/70" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gold/60 mb-1.5">
                  About this lesson
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">{part.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content tabs ─────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <PartTabs part={part} />
      </div>

      {/* ── Quiz section ─────────────────────────────────────────────── */}
      {(quiz || bestScore !== null) && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="p-5 rounded-2xl border border-border bg-surface">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="font-semibold text-text text-sm">
                    {quiz?.title ?? "Part Quiz"}
                  </p>
                  {bestScore !== null && (
                    <p className={`text-xs ${bestScore >= (quiz?.passingScore ?? 70) ? "text-success" : "text-error"}`}>
                      Best score: {bestScore}%
                    </p>
                  )}
                  {!quiz && (
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Not yet unlocked by teacher
                    </p>
                  )}
                </div>
              </div>
              {quiz && (
                <Link
                  href={`/student/classes/${classId}/quiz/${quiz.id}`}
                  className="px-4 py-2 rounded-xl bg-gold/10 border border-gold/30 text-gold text-sm font-medium hover:bg-gold/20 transition-colors"
                >
                  {quizAttempts.length > 0 ? "Retake quiz" : "Start quiz"}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Prev / Next navigation within class ──────────────────────── */}
      {(prevItem || nextItem) && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-text-muted">
              Continue the journey
            </span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              {prevItem ? (
                <Link
                  href={`/student/classes/${classId}/lesson/${prevItem.seerahPart.partNumber}`}
                  className="group flex flex-col gap-2.5 p-5 rounded-xl border border-border bg-surface hover:bg-surface-raised transition-all h-full"
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted group-hover:text-text-secondary transition-colors">
                    <ChevronLeft className="w-3 h-3" />
                    Previous lesson
                  </div>
                  <p className="text-sm font-semibold text-text line-clamp-2">
                    {prevItem.seerahPart.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
            </div>
            <div>
              {nextItem ? (
                <Link
                  href={`/student/classes/${classId}/lesson/${nextItem.seerahPart.partNumber}`}
                  className="group relative flex flex-col gap-2.5 p-5 rounded-xl border border-gold/25 bg-gradient-to-br from-gold/8 to-gold/4 hover:border-gold/40 transition-all h-full overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-gold/60">
                      Up next
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gold/50 group-hover:text-gold transition-all" />
                  </div>
                  <p className="text-sm font-semibold text-text line-clamp-2">
                    {nextItem.seerahPart.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
