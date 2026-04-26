"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  BookOpen,
  LogOut,
  ChevronRight,
  X,
  Star,
} from "lucide-react";
import { logout } from "@/lib/auth";
import type { SessionUser } from "@/lib/session";
import { roleLabel } from "@/lib/roles";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true, special: false },
  { href: "/parts", label: "All Parts", icon: BookOpen, exact: false, special: false },
  { href: "/conclusion", label: "Conclusion", icon: Star, exact: true, special: true },
];

interface SidebarProps {
  user: SessionUser;
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ user, mobile, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        "flex flex-col bg-surface border-r border-border h-full",
        mobile ? "w-full" : "w-64 flex-shrink-0"
      )}
    >
      <div className="h-16 px-4 flex items-center justify-between border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5 group" {...(onClose ? { onClick: onClose } : {})}>
          <div className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center">
            <span className="text-gold text-xs font-bold">T</span>
          </div>
          <span className="text-text font-semibold text-sm tracking-wide">TheMuslimMan</span>
        </Link>
        {mobile && (
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center flex-shrink-0">
            <span className="text-gold text-xs font-semibold">
              {user.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text truncate">{user.fullName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-gold/15 text-gold">
                {roleLabel(user.role)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              {...(onClose ? { onClick: onClose } : {})}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-gold/10 text-gold border border-gold/20"
                  : item.special
                  ? "text-gold/70 hover:text-gold hover:bg-gold/8 border border-transparent hover:border-gold/15"
                  : "text-text-secondary hover:text-text hover:bg-surface-raised"
              )}
            >
              <Icon
                className={clsx(
                  "w-4 h-4 flex-shrink-0",
                  isActive ? "text-gold" : item.special ? "text-gold/60 group-hover:text-gold" : "text-text-muted group-hover:text-text-secondary"
                )}
              />
              {item.label}
              {isActive && <ChevronRight className="w-3 h-3 ml-auto text-gold/60" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-border">
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
