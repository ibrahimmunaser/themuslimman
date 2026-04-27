import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getPartById, PARTS } from "@/lib/content";
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
  getPartAssetUrls,
} from "@/lib/files";
import { getR2AssetUrl } from "@/lib/r2";
import { ChevronLeft, ChevronRight, Clock, BookOpen, Star } from "lucide-react";
import { PartTabs } from "@/components/part/part-tabs";
import { CourseContentsDrawer } from "@/components/part/course-contents-drawer";

export async function generateStaticParams() {
  return PARTS.map((p) => ({ partId: p.id }));
}

export async function generateMetadata(props: { params: Promise<{ partId: string }> }) {
  const { partId } = await props.params;
  const part = getPartById(partId);
  if (!part) return { title: "Part Not Found" };
  return {
    title: `Part ${part.partNumber}: ${part.title}`,
    description: part.description,
  };
}

export default async function PartPage(props: { params: Promise<{ partId: string }> }) {
  await requireAuth();
  const { partId } = await props.params;

  const partBase = getPartById(partId);
  if (!partBase) notFound();

  const n = partBase.partNumber;
  
  // Load assets from R2
  const [
    briefingText,
    statementOfFactsText,
    studyGuideText,
    reportText,
    quiz,
    flashcards,
    slidesPresentedFiles,
    slidesDetailedFiles,
    slidesFactsFiles,
    infConcise,
    infStandard,
    infBento,
    hasMindmap,
    assetUrls,
  ] = await Promise.all([
    readBriefing(n),
    readStatementOfFacts(n),
    readStudyGuide(n),
    readReport(n),
    readQuiz(n),
    readFlashcards(n),
    getSlideFiles(n, "presented"),
    getSlideFiles(n, "detailed"),
    getSlideFiles(n, "facts"),
    getInfographicFilename(n, "Concise"),
    getInfographicFilename(n, "Standard"),
    getInfographicFilename(n, "Bento Grid"),
    mindmapExists(n),
    getPartAssetUrls(n),
  ]);

  const slideFiles = {
    presented: slidesPresentedFiles,
    detailed: slidesDetailedFiles,
    facts: slidesFactsFiles,
  };

  const part = {
    ...partBase,
    assets: {
      ...partBase.assets,
      videoUrl: assetUrls.videoUrl ?? undefined,
      audioUrl: assetUrls.audioUrl ?? undefined,
      briefingText: briefingText ?? undefined,
      statementOfFactsText: statementOfFactsText ?? undefined,
      studyGuideText: studyGuideText ?? undefined,
      reportText: reportText ?? undefined,
      mindmapUrl: assetUrls.mindmapUrl ?? undefined,
      quiz: quiz ?? undefined,
      flashcards: flashcards ?? undefined,
      slides: slideFiles,
      infographics: {
        concise: infConcise
          ? (infConcise.includes("infographics/") 
              ? getR2AssetUrl(infConcise) 
              : `/seerah-media/Infographics/Concise/${infConcise}`)
          : undefined,
        standard: infStandard
          ? (infStandard.includes("infographics/") 
              ? getR2AssetUrl(infStandard) 
              : `/seerah-media/Infographics/Standard/${infStandard}`)
          : undefined,
        bentoGrid: infBento
          ? (infBento.includes("infographics/") 
              ? getR2AssetUrl(infBento) 
              : `/seerah-media/Infographics/Bento Grid/${infBento}`)
          : undefined,
      },
    },
  };

  const era = ERA_MAP[part.era];
  const allParts = PARTS;
  const currentIndex = allParts.findIndex((p) => p.id === partId);
  const prevPart = currentIndex > 0 ? allParts[currentIndex - 1] : null;
  const nextPart = currentIndex < allParts.length - 1 ? allParts[currentIndex + 1] : null;
  const totalParts = allParts.length;
  const progressPct = Math.round(((currentIndex + 1) / totalParts) * 100);

  return (
    <div className="min-h-full">

      {/* ── Breadcrumb + course progress ─────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-2 text-xs text-text-muted">
              <Link href="/dashboard" className="hover:text-text-secondary transition-colors">Dashboard</Link>
              <ChevronRight className="w-3 h-3 opacity-40" />
              <Link href="/parts" className="hover:text-text-secondary transition-colors">All Parts</Link>
              <ChevronRight className="w-3 h-3 opacity-40" />
              <span className="text-text-secondary">Part {part.partNumber}</span>
            </nav>
            <CourseContentsDrawer allParts={allParts} currentPartId={partId} />
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-[11px] text-text-muted tabular-nums hidden sm:block">
              Part {currentIndex + 1} of {totalParts}
            </span>
            <div className="w-24 sm:w-36 h-[3px] bg-surface-high rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold/80 to-gold rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[11px] text-gold/70 tabular-nums font-medium">{progressPct}%</span>
          </div>
        </div>
      </div>

      {/* ── Hero panel ───────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 mb-6">
        <div className="rounded-2xl bg-surface border border-border/70 overflow-hidden">
          {/* Top gold accent line */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/35 to-transparent" />

          <div className="p-6 sm:p-8">
            {/* Metadata row */}
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
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text leading-tight tracking-tight">
              {part.title}
            </h1>
            {part.subtitle && (
              <p className="mt-2 text-base sm:text-lg text-text-secondary leading-snug">
                {part.subtitle}
              </p>
            )}

            {/* Description callout */}
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
                <p className="text-sm text-text-secondary leading-relaxed">
                  {part.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Learning modes + content ──────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <PartTabs part={part} />
      </div>

      {/* ── Continue learning ─────────────────────────────────────────────── */}
      {(prevPart || nextPart || part.partNumber === 100) && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 pb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-text-muted">
              Continue the journey
            </span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Previous */}
            <div>
              {prevPart ? (
                <Link
                  href={`/parts/${prevPart.id}`}
                  prefetch={false}
                  className="group flex flex-col gap-2.5 p-5 rounded-xl border border-border bg-surface hover:border-border-subtle hover:bg-surface-raised transition-all duration-200 h-full"
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted group-hover:text-text-secondary transition-colors">
                    <ChevronLeft className="w-3 h-3" />
                    <span>Previous lesson</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text leading-snug line-clamp-2 group-hover:text-text transition-colors">
                      {prevPart.title}
                    </p>
                    {prevPart.subtitle && (
                      <p className="text-xs text-text-muted mt-1 line-clamp-1">{prevPart.subtitle}</p>
                    )}
                  </div>
                </Link>
              ) : <div />}
            </div>

            {/* Next — regular part or Conclusion if on Part 100 */}
            <div>
              {nextPart ? (
                <Link
                  href={`/parts/${nextPart.id}`}
                  prefetch={false}
                  className="group relative flex flex-col gap-2.5 p-5 rounded-xl border border-gold/25 bg-gradient-to-br from-gold/8 to-gold/4 hover:border-gold/40 hover:from-gold/12 hover:to-gold/6 transition-all duration-200 h-full overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-gold/60">Up next</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gold/50 group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text leading-snug line-clamp-2">{nextPart.title}</p>
                    {nextPart.subtitle && (
                      <p className="text-xs text-text-muted mt-1 line-clamp-1">{nextPart.subtitle}</p>
                    )}
                  </div>
                  {nextPart.duration && (
                    <div className="flex items-center gap-1 text-[11px] text-text-muted mt-auto pt-1">
                      <Clock className="w-3 h-3" />
                      {nextPart.duration}
                    </div>
                  )}
                </Link>
              ) : part.partNumber === 100 ? (
                <Link
                  href="/conclusion"
                  className="group relative flex flex-col gap-2.5 p-5 rounded-xl border border-gold/40 bg-gradient-to-br from-gold/12 to-gold/6 hover:border-gold/60 hover:from-gold/18 hover:to-gold/10 transition-all duration-200 h-full overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-gold/70">
                      <Star className="w-2.5 h-2.5 fill-gold/50" />
                      Final Video
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gold/50 group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gold leading-snug">The Final Conclusion</p>
                    <p className="text-xs text-text-muted mt-1">A closing reflection on the life of the Prophet ﷺ</p>
                  </div>
                  <p className="text-[10px] text-gold/50 mt-auto pt-1">Complete the course →</p>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
