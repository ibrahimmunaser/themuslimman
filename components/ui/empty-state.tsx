import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center text-center p-10 rounded-2xl border border-dashed border-border bg-surface/40",
        className
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-gold/5 border border-gold/20 flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-gold/70" />
        </div>
      )}
      <p className="text-text font-semibold text-sm">{title}</p>
      {description && (
        <p className="text-text-muted text-xs mt-1.5 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
