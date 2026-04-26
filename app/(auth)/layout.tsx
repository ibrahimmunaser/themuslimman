import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink flex flex-col">
      {/* Header */}
      <div className="border-b border-border/50 px-4 sm:px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center group-hover:border-gold/60 transition-colors">
            <span className="text-gold text-xs font-bold">T</span>
          </div>
          <span className="text-text font-semibold text-sm tracking-wide">
            TheMuslimMan
          </span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 px-4 py-4 text-center">
        <p className="text-xs text-text-muted">
          © {new Date().getFullYear()} TheMuslimMan · themuslimman.com
        </p>
      </div>
    </div>
  );
}
