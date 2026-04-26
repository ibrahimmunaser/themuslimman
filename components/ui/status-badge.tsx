import { clsx } from "clsx";
import { Lock, Unlock, CheckCircle2, Clock, Circle, AlertCircle } from "lucide-react";

export type StatusVariant =
  | "released"
  | "scheduled"
  | "locked"
  | "completed"
  | "in_progress"
  | "available"
  | "overdue"
  | "draft"
  | "active"
  | "archived";

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  released: "bg-success/10 text-success border-success/30",
  scheduled: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  locked: "bg-surface-raised text-text-muted border-border",
  completed: "bg-success/10 text-success border-success/30",
  in_progress: "bg-gold/10 text-gold border-gold/30",
  available: "bg-gold/10 text-gold border-gold/30",
  overdue: "bg-error/10 text-error border-error/30",
  draft: "bg-surface-raised text-text-secondary border-border",
  active: "bg-success/10 text-success border-success/30",
  archived: "bg-surface-raised text-text-muted border-border",
};

const VARIANT_ICONS: Partial<Record<StatusVariant, React.ComponentType<{ className?: string }>>> = {
  released: Unlock,
  scheduled: Clock,
  locked: Lock,
  completed: CheckCircle2,
  in_progress: Circle,
  available: Unlock,
  overdue: AlertCircle,
};

const VARIANT_LABELS: Record<StatusVariant, string> = {
  released: "Released",
  scheduled: "Scheduled",
  locked: "Locked",
  completed: "Completed",
  in_progress: "In progress",
  available: "Available",
  overdue: "Overdue",
  draft: "Draft",
  active: "Active",
  archived: "Archived",
};

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, label, className, showIcon = true }: StatusBadgeProps) {
  const Icon = VARIANT_ICONS[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium",
        VARIANT_CLASSES[status],
        className
      )}
    >
      {showIcon && Icon && <Icon className="w-3 h-3" />}
      {label ?? VARIANT_LABELS[status]}
    </span>
  );
}
