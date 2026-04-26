import { clsx } from "clsx";

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  tone?: "gold" | "success" | "neutral" | "error";
  size?: "sm" | "md";
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  tone = "gold",
  size = "md",
  className,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={clsx("w-full", className)}>
      <div
        className={clsx(
          "w-full bg-surface-raised rounded-full overflow-hidden",
          size === "sm" ? "h-1" : "h-1.5"
        )}
      >
        <div
          className={clsx(
            "h-full rounded-full transition-all",
            tone === "gold" && "bg-gold",
            tone === "success" && "bg-success",
            tone === "neutral" && "bg-text-muted",
            tone === "error" && "bg-error"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-text-muted mt-1 tabular-nums">
          {Math.round(pct)}%
        </p>
      )}
    </div>
  );
}
