"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";
import type { SessionUser } from "@/lib/session";

interface TopbarProps {
  user: SessionUser;
  title?: string;
}

export function Topbar({ user, title }: TopbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile topbar */}
      <div className="lg:hidden h-14 border-b border-border bg-surface px-4 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-text-secondary hover:text-text transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && (
          <p className="text-sm font-medium text-text">{title}</p>
        )}
        <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
          <span className="text-gold text-xs font-semibold">
            {user.fullName.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 h-full">
            <Sidebar user={user} mobile onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
