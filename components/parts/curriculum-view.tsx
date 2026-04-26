"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Clock, Video, FileText, Map, Layers } from "lucide-react";
import type { Part, EraInfo } from "@/lib/types";

interface EraGroup {
  era: EraInfo;
  parts: Part[];
}

interface CurriculumViewProps {
  eraGroups: EraGroup[];
  totalParts: number;
}

export function CurriculumView({ eraGroups, totalParts }: CurriculumViewProps) {
  // All eras expanded by default
  const [collapsedEras, setCollapsedEras] = useState<Set<string>>(new Set());

  const toggleEra = (eraId: string) => {
    setCollapsedEras((prev) => {
      const next = new Set(prev);
      if (next.has(eraId)) next.delete(eraId);
      else next.add(eraId);
      return next;
    });
  };

  const allCollapsed = collapsedEras.size === eraGroups.length;

  const toggleAll = () => {
    if (allCollapsed) {
      setCollapsedEras(new Set());
    } else {
      setCollapsedEras(new Set(eraGroups.map((g) => g.era.id)));
    }
  };

  return (
    <div>
      {/* Controls row */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-text-secondary">
          <span className="font-semibold text-text">{totalParts}</span> lessons across{" "}
          <span className="font-semibold text-text">{eraGroups.length}</span> eras
        </p>
        <button
          onClick={toggleAll}
          className="text-xs text-text-muted hover:text-gold transition-colors"
        >
          {allCollapsed ? "Expand all" : "Collapse all"}
        </button>
      </div>

      {/* Era modules */}
      <div className="space-y-3">
        {eraGroups.map(({ era, parts }) => {
          const isCollapsed = collapsedEras.has(era.id);
          const totalDuration = parts.filter((p) => p.duration).length;

          return (
            <div
              key={era.id}
              className="rounded-2xl border border-border bg-surface overflow-hidden"
            >
              {/* Era header */}
              <button
                onClick={() => toggleEra(era.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-surface-raised transition-colors text-left group"
              >
                {/* Color bar */}
                <div
                  className="w-1 self-stretch rounded-full flex-shrink-0 min-h-[2rem]"
                  style={{ backgroundColor: era.color }}
                />

                {/* Era info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-semibold text-text text-sm">{era.label}</h2>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                      style={{
                        color: era.color,
                        borderColor: `${era.color}40`,
                        backgroundColor: `${era.color}12`,
                      }}
                    >
                      {parts.length} lessons
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{era.description}</p>
                </div>

                {/* Stats */}
                {totalDuration > 0 && (
                  <div className="hidden sm:flex items-center gap-1 text-xs text-text-muted flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{totalDuration} with video</span>
                  </div>
                )}

                {/* Chevron */}
                <div className="text-text-muted group-hover:text-text-secondary transition-colors flex-shrink-0 ml-2">
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {/* Parts list */}
              {!isCollapsed && (
                <div className="border-t border-border/60">
                  {parts.map((part, idx) => (
                    <Link
                      key={part.id}
                      href={`/parts/${part.id}`}
                      prefetch={false}
                      className={`group flex items-start gap-4 px-5 py-3.5 transition-all hover:bg-surface-raised ${
                        idx < parts.length - 1 ? "border-b border-border/40" : ""
                      }`}
                    >
                      {/* Part number */}
                      <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center flex-shrink-0 group-hover:border-gold/30 transition-colors mt-0.5">
                        <span className="text-xs font-semibold text-text-secondary group-hover:text-gold transition-colors tabular-nums">
                          {part.partNumber}
                        </span>
                      </div>

                      {/* Title + subtitle */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text leading-snug group-hover:text-gold transition-colors">
                          {part.title}
                        </p>
                        {part.subtitle && (
                          <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                            {part.subtitle}
                          </p>
                        )}

                        {/* Asset icons row */}
                        <div className="flex items-center gap-3 mt-1.5">
                          {part.assets.videoUrl && (
                            <span className="flex items-center gap-1 text-[10px] text-text-muted/70">
                              <Video className="w-2.5 h-2.5" />
                              Video
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[10px] text-text-muted/70">
                            <FileText className="w-2.5 h-2.5" />
                            Briefing
                          </span>
                          {part.assets.mindmapUrl && (
                            <span className="flex items-center gap-1 text-[10px] text-text-muted/70">
                              <Map className="w-2.5 h-2.5" />
                              Mindmap
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[10px] text-text-muted/70">
                            <Layers className="w-2.5 h-2.5" />
                            Slides
                          </span>
                        </div>
                      </div>

                      {/* Duration */}
                      {part.duration && (
                        <span className="text-[11px] text-text-muted flex-shrink-0 tabular-nums mt-0.5">
                          {part.duration}
                        </span>
                      )}

                      <ChevronRight className="w-3.5 h-3.5 text-text-muted/40 group-hover:text-gold/60 transition-colors flex-shrink-0 mt-1" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
