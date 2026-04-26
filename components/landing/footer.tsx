import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-ink">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3 max-w-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center">
                <span className="text-gold text-xs font-bold">T</span>
              </div>
              <span className="text-text font-semibold text-sm tracking-wide">
                TheMuslimMan
              </span>
            </div>
            <p className="text-text-muted text-xs leading-relaxed">
              Premium Islamic learning for the modern Muslim man. Clear, structured, and complete.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-10 gap-y-6">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Product
              </p>
              <div className="flex flex-col gap-2">
                <Link href="#what-you-get" className="text-sm text-text-muted hover:text-text-secondary transition-colors">
                  What&apos;s Inside
                </Link>
                <Link href="#pricing" className="text-sm text-text-muted hover:text-text-secondary transition-colors">
                  Pricing
                </Link>
                <Link href="/signup" className="text-sm text-text-muted hover:text-text-secondary transition-colors">
                  Get Access
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Account
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/login" className="text-sm text-text-muted hover:text-text-secondary transition-colors">
                  Log In
                </Link>
                <Link href="/signup" className="text-sm text-text-muted hover:text-text-secondary transition-colors">
                  Create Account
                </Link>
                <Link href="/dashboard" className="text-sm text-text-muted hover:text-text-secondary transition-colors">
                  Member Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} TheMuslimMan. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            themuslimman.com
          </p>
        </div>
      </div>
    </footer>
  );
}
