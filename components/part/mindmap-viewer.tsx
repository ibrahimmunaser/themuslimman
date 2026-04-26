"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Map } from "lucide-react";

interface MindmapViewerProps {
  src?: string;
  title?: string;
}

const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];

export function MindmapViewer({ src, title }: MindmapViewerProps) {
  // zoom is a fraction of the container width (1 = fill container)
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const adjustZoom = (delta: number) => {
    setZoom((z) => Math.min(3, Math.max(0.25, parseFloat((z + delta).toFixed(2)))));
  };

  const resetZoom = useCallback(() => setZoom(1), []);

  if (!src) {
    return (
      <div className="aspect-[4/3] rounded-2xl border border-border bg-surface flex flex-col items-center justify-center gap-3">
        <div className="w-14 h-14 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
          <Map className="w-6 h-6 text-gold/50" />
        </div>
        <div className="text-center">
          <p className="text-text-secondary text-sm font-medium">Mindmap coming soon</p>
          <p className="text-xs text-text-muted mt-1">Visual mindmap will be available shortly</p>
        </div>
      </div>
    );
  }

  const toolbar = (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface flex-shrink-0">
      <p className="text-sm font-medium text-text-secondary flex-1 truncate">
        {title || "Mindmap"}
      </p>
      <button
        onClick={() => adjustZoom(-0.25)}
        className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-text-muted hover:text-text transition-colors"
        title="Zoom out"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>
      <span className="text-xs text-text-muted w-10 text-center">
        {Math.round(zoom * 100)}%
      </span>
      <button
        onClick={() => adjustZoom(0.25)}
        className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-text-muted hover:text-text transition-colors"
        title="Zoom in"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={resetZoom}
        className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-text-muted hover:text-text transition-colors"
        title="Fit to width"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setFullscreen((f) => !f)}
        className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-text-muted hover:text-text transition-colors"
        title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <>
      <div
        className={
          fullscreen
            ? "fixed inset-0 z-50 bg-ink flex flex-col"
            : "rounded-2xl border border-border bg-surface overflow-hidden flex flex-col"
        }
        style={fullscreen ? undefined : { height: "70vh" }}
      >
        {toolbar}

        {/* Scroll area — wrapper div width drives zoom, image fills it */}
        <div
          ref={containerRef}
          className="overflow-auto flex-1"
        >
          <div className="p-4" style={{ width: `${zoom * 100}%`, minWidth: "100%" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={title || "Mindmap"}
              style={{ width: "100%", display: "block" }}
              className="select-none"
              draggable={false}
            />
          </div>
        </div>
      </div>

      {fullscreen && (
        <div className="fixed top-4 right-4 z-[60]">
          <button
            onClick={() => setFullscreen(false)}
            className="px-3 py-1.5 rounded-lg bg-surface border border-border text-sm text-text hover:border-gold/30 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
