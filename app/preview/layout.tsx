import Link from "next/link";
import { ChevronLeft, Sparkles } from "lucide-react";
import { buttonClass } from "@/components/ui/button";

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink text-text">
      <header className="sticky top-0 z-30 border-b border-border bg-ink/85 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to home
          </Link>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gold/80">
            <Sparkles className="w-3.5 h-3.5" />
            Free Preview
          </div>

          <Link
            href="/signup?plan=complete"
            className={buttonClass("primary", "sm")}
          >
            Get Full Access
          </Link>
        </div>
      </header>

      <main>{children}</main>

      <div className="border-t border-border bg-surface/30 mt-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
          <p className="text-gold text-xs font-medium uppercase tracking-widest mb-3">
            Enjoying the preview?
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">
            Unlock the full Seerah — all 100+ parts
          </h3>
          <p className="text-text-secondary mb-7 max-w-lg mx-auto leading-relaxed">
            You&apos;ve seen the quality. Now get the complete chronological journey,
            every video, every briefing, every mindmap and slide deck — lifetime access.
          </p>
          <Link
            href="/signup?plan=complete"
            className={buttonClass("primary", "lg", "mx-auto")}
          >
            Get Complete Access — $79
          </Link>
        </div>
      </div>
    </div>
  );
}
