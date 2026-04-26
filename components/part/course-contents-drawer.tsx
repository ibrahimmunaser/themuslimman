"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X, BookOpen, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { ERAS } from "@/lib/types";
import type { Part } from "@/lib/types";

interface CourseContentsDrawerProps {
  allParts: Pick<Part, "id" | "partNumber" | "title" | "subtitle" | "era" | "duration">[];
  currentPartId: string;
}

export function CourseContentsDrawer({ allParts, currentPartId }: CourseContentsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [collapsedEras, setCollapsedEras] = useState<Set<string>>(new Set());
  const currentItemRef = useRef<HTMLDivElement>(null);

  const eraGroups = ERAS.map((era) => ({
    era,
    parts: allParts.filter((p) => p.era === era.id),
  })).filter((g) => g.parts.length > 0);

  // Find which era the current part belongs to and ensure it's expanded
  useEffect(() => {
    const currentPart = allParts.find((p) => p.id === currentPartId);
    if (currentPart) {
      setCollapsedEras((prev) => {
        const next = new Set(prev);
        next.delete(currentPart.era);
        return next;
      });
    }
  }, [currentPartId, allParts]);

  // Scroll to current part when drawer opens
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => {
        currentItemRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 150);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const toggleEra = (eraId: string) => {
    setCollapsedEras((prev) => {
      const next = new Set(prev);
      if (next.has(eraId)) next.delete(eraId);
      else next.add(eraId);
      return next;
    });
  };

  const currentIndex = allParts.findIndex((p) => p.id === currentPartId);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-text-secondary text-xs font-medium hover:text-text hover:border-gold/30 hover:bg-surface-raised transition-all"
        aria-label="Open course contents"
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Course Contents</span>
        <span className="sm:hidden">Contents</span>
        <span className="ml-1 text-[10px] text-text-muted font-normal tabular-nums">
          {currentIndex + 1}/{allParts.length}
        </span>
      </button>

      {/* Backdrop + Panel */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsOpen(false)}
        />

        {/* Slide-in panel */}
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-sm bg-surface border-l border-border flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-raised flex-shrink-0">
            <div>
              <h2 className="font-semibold text-text text-sm">Course Contents</h2>
              <p className="text-[11px] text-text-muted mt-0.5">
                {allParts.length} lessons · Part {currentIndex + 1} selected
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-high transition-all"
              aria-label="Close course contents"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Era groups + Parts list */}
          <div className="flex-1 overflow-y-auto">
            {eraGroups.map(({ era, parts }) => {
              const isCollapsed = collapsedEras.has(era.id);
              const hasCurrentPart = parts.some((p) => p.id === currentPartId);

              return (
                <div key={era.id}>
                  {/* Era header / toggle */}
                  <button
                    onClick={() => toggleEra(era.id)}
                    className="w-full flex items-center gap-3 px-5 py-3 border-b border-border/60 hover:bg-surface-raised/60 transition-colors text-left"
                    style={{ background: hasCurrentPart ? `${era.color}08` : undefined }}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: era.color }}
                    />
                    <span className="flex-1 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                      {era.label}
                    </span>
                    <span className="text-[10px] text-text-muted tabular-nums mr-1">
                      {parts.length}
                    </span>
                    {isCollapsed ? (
                      <ChevronRight className="w-3 h-3 text-text-muted flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-text-muted flex-shrink-0" />
                    )}
                  </button>

                  {/* Parts in this era */}
                  {!isCollapsed && (
                    <div>
                      {parts.map((part) => {
                        const isCurrent = part.id === currentPartId;
                        return (
                          <div
                            key={part.id}
                            ref={isCurrent ? currentItemRef : undefined}
                          >
                            <Link
                              href={`/parts/${part.id}`}
                              onClick={() => setIsOpen(false)}
                              prefetch={false}
                              className={`flex items-start gap-3 px-5 py-3 border-b border-border/30 transition-all group ${
                                isCurrent
                                  ? "bg-gold/8 border-l-2 border-l-gold"
                                  : "hover:bg-surface-raised border-l-2 border-l-transparent"
                              }`}
                            >
                              {/* Part number */}
                              <span
                                className={`text-xs font-mono tabular-nums w-7 flex-shrink-0 mt-0.5 text-right ${
                                  isCurrent ? "text-gold font-semibold" : "text-text-muted"
                                }`}
                              >
                                {part.partNumber}
                              </span>

                              {/* Title + subtitle */}
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-[12px] font-medium leading-snug ${
                                    isCurrent
                                      ? "text-gold"
                                      : "text-text-secondary group-hover:text-text"
                                  }`}
                                >
                                  {part.title}
                                </p>
                                {part.subtitle && (
                                  <p className="text-[11px] text-text-muted mt-0.5 leading-snug line-clamp-1">
                                    {part.subtitle}
                                  </p>
                                )}
                                {part.duration && (
                                  <p className="text-[10px] text-text-muted/60 mt-1">{part.duration}</p>
                                )}
                              </div>

                              {/* Current indicator */}
                              {isCurrent && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                              )}
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border bg-surface-raised flex-shrink-0">
            <Link
              href="/parts"
              onClick={() => setIsOpen(false)}
              className="text-xs text-text-muted hover:text-gold transition-colors"
            >
              View full curriculum →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
