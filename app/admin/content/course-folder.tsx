"use client";

import { useState } from "react";
import {
  ChevronDown, ChevronRight, BookOpen, Layers, CheckCircle2, Globe,
} from "lucide-react";
import { ERA_MAP } from "@/lib/types";

interface Part {
  id: string;
  partNumber: number;
  title: string;
  era: string;
  includedInEssentials: boolean;
  isPublished: boolean;
}

interface Props {
  courseId:    string;
  title:       string;
  description: string | null;
  parts:       Part[];
  defaultOpen?: boolean;
}

export function CourseFolder({ title, description, parts, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  const publishedCount  = parts.filter((p) => p.isPublished).length;
  const essentialCount  = parts.filter((p) => p.includedInEssentials).length;

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      {/* Folder header — click to collapse/expand */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 bg-surface-raised hover:bg-surface-raised/80 transition-colors text-left group"
      >
        {/* Folder icon + chevron */}
        <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-gold" />
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold text-text">{title}</span>
          </div>
          {description && (
            <p className="text-xs text-text-muted mt-0.5 truncate">{description}</p>
          )}
        </div>

        {/* Stats pills */}
        <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
          <Stat icon={<Layers className="w-3.5 h-3.5" />}  label={`${parts.length} parts`} />
          <Stat icon={<Globe className="w-3.5 h-3.5" />}   label={`${publishedCount} published`} color="text-green-400" />
          <Stat icon={<CheckCircle2 className="w-3.5 h-3.5" />} label={`${essentialCount} essentials`} color="text-gold" />
        </div>

        <span className="flex-shrink-0 text-text-muted group-hover:text-text transition-colors">
          {open
            ? <ChevronDown className="w-4 h-4" />
            : <ChevronRight className="w-4 h-4" />}
        </span>
      </button>

      {/* Parts table */}
      {open && (
        <div className="border-t border-border overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface border-b border-border">
              <tr className="text-left">
                <th className="px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wider">#</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Title</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">Era</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">Essentials</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Published</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {parts.map((p) => {
                const era = ERA_MAP[p.era as keyof typeof ERA_MAP];
                return (
                  <tr key={p.id} className="hover:bg-surface-raised/40 transition-colors">
                    <td className="px-4 py-2.5 text-sm text-text-muted tabular-nums font-mono">
                      {String(p.partNumber).padStart(3, "0")}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-text">{p.title}</td>
                    <td className="px-4 py-2.5 text-xs text-text-muted hidden sm:table-cell">
                      {era?.label ?? p.era}
                    </td>
                    <td className="px-4 py-2.5 text-xs hidden md:table-cell">
                      {p.includedInEssentials
                        ? <span className="text-gold">Yes</span>
                        : <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-xs">
                      {p.isPublished
                        ? <span className="text-green-400">Published</span>
                        : <span className="text-text-muted">Draft</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon, label, color = "text-text-muted",
}: {
  icon: React.ReactNode;
  label: string;
  color?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${color}`}>
      {icon}
      {label}
    </span>
  );
}
