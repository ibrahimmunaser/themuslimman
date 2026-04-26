import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { PARTS } from "@/lib/content";
import { ERAS } from "@/lib/types";
import { CurriculumView } from "@/components/parts/curriculum-view";
import { Star } from "lucide-react";

export const metadata = {
  title: "Course Curriculum",
};

export default async function PartsPage() {
  await requireAuth();
  const parts = PARTS;

  const eraGroups = ERAS.map((era) => ({
    era,
    parts: parts.filter((p) => p.era === era.id),
  })).filter((g) => g.parts.length > 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">
              The Seerah Course
            </h1>
            <p className="text-text-secondary mt-1.5 text-sm leading-relaxed max-w-xl">
              A complete journey through the life of the Prophet Muhammad ﷺ — from pre-Islamic Arabia
              to the final years of his prophethood.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0 pt-1">
            <span className="text-2xl font-bold text-gold tabular-nums">{parts.length}</span>
            <span className="text-xs text-text-muted">lessons total</span>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-6 h-px bg-gradient-to-r from-gold/30 via-border to-transparent" />
      </div>

      {/* Curriculum */}
      <CurriculumView eraGroups={eraGroups} totalParts={parts.length} />

      {/* Conclusion video card */}
      <div className="mt-6">
        <Link
          href="/conclusion"
          className="group relative flex items-center gap-4 p-5 rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/8 to-gold/4 hover:border-gold/50 hover:from-gold/12 hover:to-gold/6 transition-all overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0">
            <Star className="w-4.5 h-4.5 text-gold fill-gold/30" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gold/60 mb-0.5">After Part 100</p>
            <p className="text-sm font-semibold text-text group-hover:text-gold transition-colors">
              The Final Conclusion
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              A closing reflection on the life of the Prophet ﷺ
            </p>
          </div>
          <Star className="w-4 h-4 text-gold/40 group-hover:text-gold transition-colors flex-shrink-0" />
        </Link>
      </div>
    </div>
  );
}
