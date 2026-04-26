"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { buttonClass } from "@/components/ui/button";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="border-b border-white/5 bg-ink/80 backdrop-blur-xl">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center group-hover:border-gold/60 transition-colors">
              <span className="text-gold text-xs font-bold">T</span>
            </div>
            <span className="text-text font-semibold text-sm tracking-wide">
              TheMuslimMan
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-text-secondary hover:text-text transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-text-secondary hover:text-text transition-colors">
              Login
            </Link>
            <Link href="/get-started" className={buttonClass("primary", "sm")}>
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-text-secondary hover:text-text transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-border px-4 py-4 flex flex-col gap-4 bg-ink">
            <Link href="/pricing" onClick={() => setOpen(false)} className="text-sm text-text-secondary hover:text-text transition-colors">
              Pricing
            </Link>
            <Link href="/login" onClick={() => setOpen(false)} className="text-sm text-text-secondary hover:text-text transition-colors">
              Login
            </Link>
            <Link
              href="/get-started"
              onClick={() => setOpen(false)}
              className={buttonClass("primary", "sm", "w-full justify-center")}
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
