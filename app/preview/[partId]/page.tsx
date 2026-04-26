import { notFound } from "next/navigation";
import Link from "next/link";
import { getPartById, getPartsForPlan, PARTS } from "@/lib/content";
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
import { ChevronRight, Clock, BookOpen } from "lucide-react";
import { PartTabs } from "@/components/part/part-tabs";

export async function generateStaticParams() {
  return PARTS.map((p) => ({ partId: p.id }));
}

export async function generateMetadata(props: { params: Promise<{ partId: string }> }) {
  const { partId } = await props.params;
  const part = getPartById(partId);
  if (!part) return { title: "Preview Not Found" };
  return {
    title: `Free Preview — Part ${part.partNumber}: ${part.title}`,
    description: part.description,
  };
}

export default async function PreviewPartPage(props: { params: Promise<{ partId: string }> }) {
  const { partId } = await props.params;

  const partBase = getPartById(partId);
  if (!partBase) notFound();

  const n = partBase.partNumber;
  
  // Fetch all async data in parallel
  const [
    slidesPresented,
    slidesDetailed,
    slidesFacts,
    briefingText,
    statementOfFactsText,
    studyGuideText,
    reportText,
    hasMindmap,
    quiz,
    flashcards,
    infConcise,
    infStandard,
    infBento,
    assetUrls,
  ] = await Promise.all([
    getSlideFiles(n, "presented"),
    getSlideFiles(n, "detailed"),
    getSlideFiles(n, "facts"),
    readBriefing(n),
    readStatementOfFacts(n),
    readStudyGuide(n),
    readReport(n),
    mindmapExists(n),
    readQuiz(n),
    readFlashcards(n),
    getInfographicFilename(n, "Concise"),
    getInfographicFilename(n, "Standard"),
    getInfographicFilename(n, "Bento Grid"),
    getPartAssetUrls(n),
  ]);

  const slideFiles = {
    presented: slidesPresented.map((p) => {
      return p.includes("slides-") ? getR2AssetUrl(p) : `/seerah-media/${p}`;
    }),
    detailed: slidesDetailed.map((p) => {
      return p.includes("slides-") ? getR2AssetUrl(p) : `/seerah-media/${p}`;
    }),
    facts: slidesFacts.map((p) => {
      return p.includes("slides-") ? getR2AssetUrl(p) : `/seerah-media/${p}`;
    }),
  };

  const part = {
    ...partBase,
    assets: {
      ...partBase.assets,
      briefingText: briefingText ?? undefined,
      statementOfFactsText: statementOfFactsText ?? undefined,
      studyGuideText: studyGuideText ?? undefined,
      reportText: reportText ?? undefined,
      mindmapUrl: assetUrls.mindmapUrl,
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
  const allParts = getPartsForPlan("complete");
  const currentIndex = allParts.findIndex((p) => p.id === partId);
  const totalParts = allParts.length;
  const progressPct = Math.round(((currentIndex + 1) / totalParts) * 100);

  const otherPreviewId = partId === "part-1" ? "part-2" : "part-1";
  const otherPreview = getPartById(otherPreviewId);

  return (
    <div className="min-h-full py-6 sm:py-8">

      {/* ── Breadcrumb + progress ─────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
        <div className="flex items-center justify-between gap-6">
          <nav className="flex items-center gap-2 text-xs text-text-muted">
            <Link href="/" className="hover:text-text-secondary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 opacity-40" />
            <span className="text-gold/70 font-medium">Free Preview</span>
            <ChevronRight className="w-3 h-3 opacity-40" />
            <span className="text-text-secondary">Part {part.partNumber}</span>
          </nav>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-[11px] text-text-muted tabular-nums hidden sm:block">
              Part {currentIndex + 1} of {totalParts}
            </span>
            <div className="w-24 sm:w-36 h-[3px] bg-surface-high rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold/80 to-gold rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[11px] text-gold/70 tabular-nums font-medium">{progressPct}%</span>
          </div>
        </div>
      </div>

      {/* ── Hero panel ───────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="rounded-2xl bg-surface border border-border/70 overflow-hidden">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/35 to-transparent" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/12 border border-gold/25 text-gold text-xs font-semibold">
                Part {part.partNumber}
              </span>
              {era && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-raised border border-border text-text-secondary text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: era.color }} />
                  {era.label}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-raised border border-border text-text-secondary text-xs font-medium">
                Free Preview
              </span>
              {part.duration && (
                <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                  <Clock className="w-3 h-3" />
                  {part.duration}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text leading-tight tracking-tight">
              {part.title}
            </h1>
            {part.subtitle && (
              <p className="mt-2 text-base sm:text-lg text-text-secondary leading-snug">
                {part.subtitle}
              </p>
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
                <p className="text-sm text-text-secondary leading-relaxed">
                  {part.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Learning modes ────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <PartTabs part={part} />
      </div>

      {/* ── Also free to preview ──────────────────────────────────────────── */}
      {otherPreview && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 pb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-text-muted">
              Also free to preview
            </span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          <Link
            href={`/preview/${otherPreviewId}`}
            className="group relative flex items-center gap-5 p-5 rounded-xl border border-gold/20 bg-gradient-to-br from-gold/8 to-gold/3 hover:border-gold/35 hover:from-gold/12 hover:to-gold/6 transition-all duration-200 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
            <div className="w-11 h-11 rounded-xl bg-surface-raised border border-border flex items-center justify-center flex-shrink-0 group-hover:border-gold/30 transition-colors">
              <span className="text-base font-bold text-text-secondary group-hover:text-gold transition-colors">
                {otherPreview.partNumber}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text leading-snug">{otherPreview.title}</p>
              {otherPreview.subtitle && (
                <p className="text-xs text-text-muted mt-1">{otherPreview.subtitle}</p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-gold/40 group-hover:text-gold group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </Link>
        </div>
      )}

    </div>
  );
}
