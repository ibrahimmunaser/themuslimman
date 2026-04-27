import Link from "next/link";
import { CheckCircle2, Lock } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-text mb-4">
              <span className="w-7 h-7 rounded-lg bg-gold/15 border border-gold/25 flex items-center justify-center text-gold text-sm">
                T
              </span>
              TheMuslimMan
            </Link>
            <p className="text-sm text-text-muted leading-relaxed mb-4">
              Premium Islamic learning for the modern Muslim man. Clear, structured, and complete.
            </p>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              <span>5,000+ Active Students</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-text text-sm mb-4">Product</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Watch Part 1 Free", href: "/preview/part-1" },
                { label: "Watch Part 2 Free", href: "/preview/part-2" },
                { label: "What's Inside", href: "/#what-you-get" },
                { label: "Pricing", href: "/#pricing" },
                { label: "Get Started", href: "/get-started" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-text text-sm mb-4">Support</h3>
            <ul className="space-y-2.5">
              {[
                { label: "FAQ", href: "#" },
                { label: "Contact Us", href: "#" },
                { label: "Help Center", href: "#" },
                { label: "System Requirements", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold text-text text-sm mb-4">Account</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Log In", href: "/login" },
                { label: "Create Account", href: "/signup" },
                { label: "Member Dashboard", href: "/dashboard" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 py-6 border-t border-border mb-6">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Checkout</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            <span>Instant Access</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            <span>30-Day Guarantee</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            <span>Lifetime Access</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
          <p className="text-sm text-text-muted">
            © {currentYear} TheMuslimMan. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="text-sm text-text-muted hover:text-text transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm text-text-muted hover:text-text transition-colors"
            >
              Terms
            </Link>
            <a
              href="https://themuslimman.com"
              className="text-sm text-text-muted hover:text-text transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              themuslimman.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
