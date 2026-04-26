import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import { VideoPlayer } from "@/components/part/video-player";
import { videoExists } from "@/lib/files";

export const metadata = {
  title: "The Conclusion — Seerah Course",
  description:
    "The final video of the Seerah course — a closing reflection on the life of the Prophet Muhammad ﷺ and the journey we have taken together.",
};

export default async function ConclusionPage() {
  await requireAuth();

  const videoUrl = videoExists(101) ? "/api/media/video/101" : null;

  return (
    <div className="min-h-full">
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6">
        <nav className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/dashboard" className="hover:text-text-secondary transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <Link href="/parts" className="hover:text-text-secondary transition-colors">
            All Parts
          </Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <span className="text-text-secondary">Conclusion</span>
        </nav>
      </div>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 mb-6">
        <div className="rounded-2xl bg-surface border border-border/70 overflow-hidden">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

          <div className="p-6 sm:p-8">
            {/* Badge */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-semibold">
                <Star className="w-3 h-3 fill-gold" />
                Course Conclusion
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-raised border border-border text-text-secondary text-xs font-medium">
                After Part 100
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text leading-tight tracking-tight">
              The Final Conclusion
            </h1>
            <p className="mt-2 text-base sm:text-lg text-text-secondary leading-snug">
              A closing reflection on the life of the Prophet Muhammad ﷺ
            </p>

            {/* Description callout */}
            <div className="mt-6 flex gap-4 p-4 sm:p-5 rounded-xl bg-gold/5 border border-gold/20">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-7 h-7 rounded-lg bg-gold/15 border border-gold/25 flex items-center justify-center">
                  <Star className="w-3.5 h-3.5 text-gold/80 fill-gold/40" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gold/70 mb-1.5">
                  End of the Course
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  You have journeyed through 100 parts of the greatest story ever told. This final video 
                  brings the Seerah course to a close — reflecting on the life of the Prophet ﷺ, 
                  the lessons it carries, and what it means to carry this legacy forward.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        {videoUrl ? (
          <div className="rounded-2xl overflow-hidden border border-border/60 shadow-xl">
            <VideoPlayer
              src={videoUrl}
              title="The Final Conclusion — Seerah Course"
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-12 text-center">
            <Star className="w-10 h-10 text-gold/30 mx-auto mb-3" />
            <p className="text-text-secondary font-medium">Conclusion video coming soon</p>
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-border/60" />
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-text-muted">
            You have completed the course
          </span>
          <div className="h-px flex-1 bg-border/60" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <Link
            href="/parts/part-100"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-text-secondary hover:text-text hover:border-border-subtle transition-all"
          >
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            Back to Part 100
          </Link>
          <Link
            href="/parts"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gold/30 bg-gold/8 text-sm text-gold hover:border-gold/50 hover:bg-gold/12 transition-all"
          >
            <Star className="w-3.5 h-3.5 fill-gold/30" />
            Browse All Parts
          </Link>
        </div>
      </div>
    </div>
  );
}
