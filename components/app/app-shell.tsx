"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { RoleSidebar } from "./role-sidebar";
import type { SessionUser } from "@/lib/session";

interface AppShellProps {
  user: SessionUser;
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-ink overflow-hidden">
      <div className="hidden lg:flex lg:flex-shrink-0">
        <RoleSidebar user={user} />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="lg:hidden h-14 border-b border-border bg-surface px-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-text-secondary hover:text-text transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
            <span className="text-gold text-xs font-semibold">
              {user.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-72 h-full">
              <RoleSidebar user={user} mobile onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
