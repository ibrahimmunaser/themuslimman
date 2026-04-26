import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  tone?: "default" | "gold" | "success" | "warning";
  className?: string;
}

export function StatCard({ label, value, icon: Icon, hint, tone = "default", className }: StatCardProps) {
  return (
    <div
      className={clsx(
        "bg-surface border border-border rounded-xl p-4 transition-colors hover:border-border-subtle",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        {Icon && (
          <Icon
            className={clsx(
              "w-4 h-4",
              tone === "gold" && "text-gold",
              tone === "success" && "text-success",
              tone === "warning" && "text-amber-400",
              tone === "default" && "text-text-muted"
            )}
          />
        )}
        <p className="text-xs text-text-muted">{label}</p>
      </div>
      <p
        className={clsx(
          "text-2xl font-bold tabular-nums",
          tone === "gold" ? "text-gold" : "text-text"
        )}
      >
        {value}
      </p>
      {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
    </div>
  );
}
