"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Layers, Maximize2, X } from "lucide-react";

interface SlidesViewerProps {
  slides: string[];
  title?: string;
  type?: "presented" | "detailed";
}

export function SlidesViewer({ slides, title, type = "presented" }: SlidesViewerProps) {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);
  const next = useCallback(
    () => setCurrent((c) => Math.min(slides.length - 1, c + 1)),
    [slides.length]
  );

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const thumb = strip.querySelectorAll("button")[current] as HTMLElement | undefined;
    thumb?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [current]);

  useEffect(() => {
    if (!fullscreen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [fullscreen, prev, next]);

  if (!slides.length) {
    return (
      <div className="aspect-video rounded-2xl border border-border bg-surface flex flex-col items-center justify-center gap-3">
        <div className="w-14 h-14 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
          <Layers className="w-6 h-6 text-gold/50" />
        </div>
        <div className="text-center">
          <p className="text-text-secondary text-sm font-medium">Slides coming soon</p>
          <p className="text-xs text-text-muted mt-1">
            {type === "presented" ? "Presented" : "Detailed"} slides will be available shortly
          </p>
        </div>
      </div>
    );
  }

  const nextSlide = slides[current + 1];

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 bg-black flex flex-col"
          : "rounded-2xl border border-border overflow-hidden bg-black flex flex-col"
      }
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-ink/80 border-b border-border/50 flex-shrink-0">
        <Layers className="w-4 h-4 text-gold flex-shrink-0" />
        <p className="text-sm text-text-secondary flex-1 truncate">
          {title || (type === "presented" ? "Presented Slides" : "Detailed Slides")}
        </p>
        <span className="text-xs text-text-muted tabular-nums">
          {current + 1} / {slides.length}
        </span>
        <button
          onClick={() => setFullscreen((f) => !f)}
          className="text-text-muted hover:text-text transition-colors"
        >
          {fullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Slide area — 16:9 aspect ratio container */}
      <div
        className={`relative flex-1 bg-black ${!fullscreen ? "group cursor-zoom-in" : ""}`}
        style={{ minHeight: fullscreen ? undefined : "420px" }}
        onClick={!fullscreen ? () => setFullscreen(true) : undefined}
        title={!fullscreen ? "Click to enlarge" : undefined}
      >
        {/* Current slide */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full">
            <Image
              key={slides[current]}
              src={slides[current]}
              alt={`Slide ${current + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              priority
              unoptimized={false}
            />
          </div>
        </div>

        {/* Click-to-enlarge hint overlay (only in non-fullscreen) */}
        {!fullscreen && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/70 border border-white/15 text-white text-xs font-medium">
              <Maximize2 className="w-3.5 h-3.5" />
              Enlarge
            </div>
          </div>
        )}

        {/* Invisible preload of next slide — tells browser to fetch it now */}
        {nextSlide && (
          <div className="sr-only" aria-hidden>
            <Image
              src={nextSlide}
              alt=""
              width={1}
              height={1}
              sizes="1px"
              priority={false}
              unoptimized={false}
            />
          </div>
        )}

        {/* Nav arrows — stop propagation so they don't trigger the enlarge click */}
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          disabled={current === 0}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-white/40 disabled:opacity-20 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          disabled={current === slides.length - 1}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-white/40 disabled:opacity-20 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Thumbnail strip */}
      {slides.length > 1 && (
        <div ref={stripRef} className="pl-4 py-3 bg-ink/80 border-t border-border/50 flex gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
          {slides.map((slide, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 w-16 h-10 rounded border overflow-hidden transition-all relative ${
                i === current
                  ? "border-gold ring-1 ring-gold/30"
                  : "border-border/50 opacity-50 hover:opacity-100"
              }`}
            >
              {Math.abs(i - current) <= 6 ? (
                <Image
                  src={slide}
                  alt={`Slide ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-surface-raised flex items-center justify-center">
                  <span className="text-[9px] text-text-muted">{i + 1}</span>
                </div>
              )}
            </button>
          ))}
          <div className="flex-shrink-0 w-6" aria-hidden />
        </div>
      )}
    </div>
  );
}
