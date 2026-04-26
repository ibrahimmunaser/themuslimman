"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { Maximize2 } from "lucide-react";
import {
  Video,
  BookOpen,
  GraduationCap,
  FileText,
  BarChart2,
  Map,
  Image as ImageIcon,
  Layers,
  HelpCircle,
  Layers2,
} from "lucide-react";
import NextImage from "next/image";
import { VideoPlayer } from "./video-player";
import { AudioPlayer } from "./audio-player";
import { TextViewer } from "./text-viewer";
import { FactsViewer } from "./facts-viewer";
import { MindmapViewer } from "./mindmap-viewer";
import { SlidesViewer } from "./slides-viewer";
import { QuizViewer } from "./quiz-viewer";
import { FlashcardsViewer } from "./flashcards-viewer";
import type { Part } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type ModeId = "watch" | "read" | "study" | "slides" | "mindmap" | "infographic" | "flashcards" | "quiz";

type SubTabId =
  | "video" | "audio"
  | "briefing" | "study-guide" | "facts" | "report"
  | "flashcards" | "quiz"
  | "slides" | "mindmap" | "infographic";

interface SubTab { id: SubTabId; label: string; icon: React.FC<{ className?: string }>; }
interface Mode {
  id: ModeId;
  label: string;
  hint: string;
  icon: React.FC<{ className?: string }>;
  subTabs: SubTab[];
  primary?: boolean;
}

// ─── Mode definitions ─────────────────────────────────────────────────────────

const MODES: Mode[] = [
  {
    id: "watch",       label: "Watch",       hint: "Video lesson",    icon: Video,        primary: true,
    subTabs: [{ id: "video",       label: "Video",       icon: Video }],
  },
  {
    id: "slides",      label: "Slides",      hint: "Slide decks",     icon: Layers,
    subTabs: [{ id: "slides",      label: "Slides",      icon: Layers }],
  },
  {
    id: "infographic", label: "Infographic", hint: "Visual summary",  icon: ImageIcon,
    subTabs: [{ id: "infographic", label: "Infographic", icon: ImageIcon }],
  },
  {
    id: "read",        label: "Read",        hint: "Written content",  icon: BookOpen,
    subTabs: [
      { id: "briefing",    label: "Briefing",    icon: FileText },
      { id: "study-guide", label: "Study Guide", icon: BookOpen },
      { id: "facts",       label: "Facts",       icon: BarChart2 },
      { id: "report",      label: "Deep Dive",   icon: FileText },
    ],
  },
  {
    id: "study",       label: "Study",       hint: "Active review",   icon: GraduationCap,
    subTabs: [
      { id: "flashcards", label: "Flashcards", icon: Layers2 },
      { id: "quiz",       label: "Quiz",       icon: HelpCircle },
    ],
  },
  {
    id: "mindmap",     label: "Mindmap",     hint: "Visual map",      icon: Map,
    subTabs: [{ id: "mindmap",     label: "Mindmap",     icon: Map }],
  },
  {
    id: "flashcards",  label: "Flashcards",  hint: "Memory cards",    icon: Layers2,
    subTabs: [{ id: "flashcards",  label: "Flashcards",  icon: Layers2 }],
  },
  {
    id: "quiz",        label: "Quiz",        hint: "Test yourself",   icon: HelpCircle,
    subTabs: [{ id: "quiz",        label: "Quiz",        icon: HelpCircle }],
  },
];

// ─── Content availability ─────────────────────────────────────────────────────

function subTabHasContent(id: SubTabId, part: Part): boolean {
  switch (id) {
    case "video":       return !!part.assets.videoUrl;
    case "audio":       return !!part.assets.audioUrl;
    case "briefing":    return !!part.assets.briefingText;
    case "study-guide": return !!part.assets.studyGuideText;
    case "facts":       return !!part.assets.statementOfFactsText;
    case "report":      return !!part.assets.reportText;
    case "flashcards":  return !!part.assets.flashcards;
    case "quiz":        return !!part.assets.quiz;
    case "slides":      return !!(
      part.assets.slides?.presented.length ||
      part.assets.slides?.detailed.length ||
      part.assets.slides?.facts.length
    );
    case "mindmap":     return !!part.assets.mindmapUrl;
    case "infographic": return !!(
      part.assets.infographics?.concise ||
      part.assets.infographics?.standard ||
      part.assets.infographics?.bentoGrid
    );
  }
}

function getModeSubTabs(mode: Mode, part: Part): SubTab[] {
  return mode.subTabs.filter((t) => subTabHasContent(t.id, part));
}

// ─── Content panels ───────────────────────────────────────────────────────────

function EmptyContent({ label }: { label: string }) {
  return (
    <div className="py-14 text-center">
      <p className="text-text-secondary text-sm font-medium">{label} coming soon</p>
      <p className="text-xs text-text-muted mt-1">This content will be available shortly</p>
    </div>
  );
}

function InfographicPanel({ part }: { part: Part }) {
  const [style, setStyle] = useState<"concise" | "standard" | "bentoGrid">("standard");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const inf = part.assets.infographics;
  const styles = [
    { id: "concise"   as const, label: "Concise" },
    { id: "standard"  as const, label: "Standard" },
    { id: "bentoGrid" as const, label: "Bento Grid" },
  ].filter((s) => inf?.[s.id]);
  const currentSrc = inf?.[style] ?? inf?.[styles[0]?.id];
  const altLabel = `Part ${part.partNumber} Infographic — ${style}`;

  return (
    <div>
      {styles.length > 1 && (
        <div className="flex gap-2 mb-4">
          {styles.map((s) => (
            <button
              key={s.id} onClick={() => setStyle(s.id)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                style === s.id
                  ? "bg-gold/12 text-gold border-gold/25"
                  : "bg-surface text-text-muted border-border hover:text-text-secondary hover:border-border-subtle"
              )}
            >{s.label}</button>
          ))}
        </div>
      )}
      {currentSrc ? (
        <>
          <div
            className="relative group rounded-xl border border-border/60 bg-surface overflow-hidden cursor-zoom-in"
            onClick={() => setLightboxOpen(true)}
            title="Click to enlarge"
          >
            <NextImage
              src={currentSrc}
              alt={altLabel}
              width={1920} height={1080}
              className="w-full h-auto"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
              unoptimized
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/70 border border-white/15 text-white text-xs font-medium">
                <Maximize2 className="w-3.5 h-3.5" />
                Enlarge
              </div>
            </div>
          </div>
          <ImageLightbox
            src={currentSrc}
            alt={altLabel}
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
          />
        </>
      ) : (
        <EmptyContent label="Infographic" />
      )}
    </div>
  );
}

const SLIDE_TYPES = [
  { key: "presented" as const, label: "Presented" },
  { key: "detailed"  as const, label: "Detailed" },
  { key: "facts"     as const, label: "Facts" },
];

function SlidesPanel({ part }: { part: Part }) {
  const slides = part.assets.slides;
  const available = SLIDE_TYPES.filter((t) => (slides?.[t.key]?.length ?? 0) > 0);
  const [type, setType] = useState<"presented" | "detailed" | "facts">(available[0]?.key ?? "presented");

  return (
    <div>
      {available.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {available.map((t) => (
            <button
              key={t.key} onClick={() => setType(t.key)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                type === t.key
                  ? "bg-gold/12 text-gold border-gold/25"
                  : "bg-surface text-text-muted border-border hover:text-text-secondary"
              )}
            >{t.label}</button>
          ))}
        </div>
      )}
      <SlidesViewer
        slides={slides?.[type] ?? []}
        title={`Part ${part.partNumber} — ${SLIDE_TYPES.find((t) => t.key === type)?.label} Slides`}
        type={type === "facts" ? "presented" : type}
      />
    </div>
  );
}

function SubTabContent({ id, part }: { id: SubTabId; part: Part }) {
  const wrap = (child: React.ReactNode) => (
    <div className="rounded-xl border border-border/60 bg-surface p-5 sm:p-7">{child}</div>
  );

  switch (id) {
    case "video":
      return (
        <VideoPlayer
          src={part.assets.videoUrl}
          title={part.title}
          poster={part.assets.slides?.presented[0]}
        />
      );
    case "audio":
      return <AudioPlayer src={part.assets.audioUrl} title={part.title} partNumber={part.partNumber} />;
    case "briefing":
      return wrap(part.assets.briefingText ? <TextViewer content={part.assets.briefingText} /> : <EmptyContent label="Briefing" />);
    case "study-guide":
      return wrap(part.assets.studyGuideText ? <TextViewer content={part.assets.studyGuideText} /> : <EmptyContent label="Study Guide" />);
    case "facts":
      return wrap(part.assets.statementOfFactsText ? <FactsViewer content={part.assets.statementOfFactsText} /> : <EmptyContent label="Statement of Facts" />);
    case "report":
      return wrap(part.assets.reportText ? <TextViewer content={part.assets.reportText} /> : <EmptyContent label="Deep Dive Report" />);
    case "flashcards":
      return wrap(part.assets.flashcards ? <FlashcardsViewer flashcards={part.assets.flashcards} /> : <EmptyContent label="Flashcards" />);
    case "quiz":
      return wrap(part.assets.quiz ? <QuizViewer quiz={part.assets.quiz} /> : <EmptyContent label="Quiz" />);
    case "slides":      return <SlidesPanel part={part} />;
    case "mindmap":     return <MindmapViewer src={part.assets.mindmapUrl} title={`Part ${part.partNumber} — Mindmap`} />;
    case "infographic": return <InfographicPanel part={part} />;
  }
}

// ─── Mode button ──────────────────────────────────────────────────────────────

function ModeButton({
  mode,
  isActive,
  isAvailable,
  onClick,
}: {
  mode: Mode;
  isActive: boolean;
  isAvailable: boolean;
  onClick: () => void;
}) {
  const Icon = mode.icon;

  return (
    <button
      onClick={onClick}
      disabled={!isAvailable}
      style={
        isActive
          ? { boxShadow: "0 0 0 1px rgba(200,169,110,0.30), 0 4px 20px rgba(200,169,110,0.07)" }
          : undefined
      }
      className={clsx(
        "group relative flex items-center gap-3 px-4 py-3.5 rounded-xl border flex-shrink-0 transition-all duration-200 text-left min-w-0",
        isActive
          ? "border-gold/35 bg-gradient-to-b from-gold/10 to-gold/5 text-gold"
          : isAvailable
          ? "border-border bg-surface text-text-muted hover:border-border-subtle hover:bg-surface-raised hover:text-text-secondary cursor-pointer"
          : "border-border/30 bg-surface/50 text-text-muted/25 cursor-not-allowed opacity-40 pointer-events-none"
      )}
    >
      {/* Icon container */}
      <div
        className={clsx(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
          isActive
            ? "bg-gold/15"
            : "bg-surface-raised group-hover:bg-surface-high"
        )}
      >
        <Icon className="w-4 h-4" />
      </div>

      {/* Labels */}
      <div className="min-w-0">
        <p className="text-[13px] font-semibold leading-none">{mode.label}</p>
        <p className="text-[10px] mt-0.5 leading-none opacity-55 hidden sm:block">{mode.hint}</p>
      </div>

      {/* "Start" indicator on Watch when idle */}
      {mode.primary && isAvailable && !isActive && (
        <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-gold/10 text-gold/60 font-semibold uppercase tracking-wider flex-shrink-0">
          Start
        </span>
      )}

      {/* Active underline pip */}
      {isActive && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-0 w-6 h-[2px] bg-gold rounded-full" />
      )}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface PartTabsProps {
  part: Part;
}

export function PartTabs({ part }: PartTabsProps) {
  const availableModes = MODES.filter((m) => getModeSubTabs(m, part).length > 0);
  const defaultMode = availableModes[0] ?? MODES[0];

  const [activeMode, setActiveMode] = useState<ModeId>(defaultMode.id);

  const currentMode = MODES.find((m) => m.id === activeMode) ?? defaultMode;
  const subTabs = getModeSubTabs(currentMode, part);
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>(subTabs[0]?.id ?? "video");

  const handleModeChange = (modeId: ModeId) => {
    setActiveMode(modeId);
    const newMode = MODES.find((m) => m.id === modeId)!;
    const newSubTabs = getModeSubTabs(newMode, part);
    setActiveSubTab(newSubTabs[0]?.id ?? newMode.subTabs[0].id);
  };

  const currentSubTab = subTabs.find((t) => t.id === activeSubTab)?.id ?? subTabs[0]?.id;

  return (
    <div className="space-y-4">

      {/* ── Mode selector strip ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {MODES.map((mode) => {
          const available = getModeSubTabs(mode, part).length > 0;
          return (
            <ModeButton
              key={mode.id}
              mode={mode}
              isActive={activeMode === mode.id}
              isAvailable={available}
              onClick={() => available && handleModeChange(mode.id)}
            />
          );
        })}
      </div>

      {/* ── Sub-tab bar (only when mode has multiple content items) ────── */}
      {subTabs.length > 1 && (
        <div className="flex gap-1.5 flex-wrap">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150",
                  isActive
                    ? "bg-gold/10 text-gold border-gold/25"
                    : "bg-surface text-text-muted border-border hover:text-text-secondary hover:border-border-subtle hover:bg-surface-raised"
                )}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {currentSubTab && (
        <div>
          <SubTabContent
            key={`${activeMode}-${currentSubTab}`}
            id={currentSubTab}
            part={part}
          />
        </div>
      )}

    </div>
  );
}
