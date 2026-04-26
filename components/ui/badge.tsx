import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "surface" | "success" | "muted";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "surface", size = "sm", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center font-medium rounded-full",
        {
          "bg-gold/15 text-gold border border-gold/25": variant === "gold",
          "bg-surface-raised text-text-secondary border border-border": variant === "surface",
          "bg-success/15 text-green-400 border border-success/25": variant === "success",
          "bg-surface text-text-muted border border-border-subtle": variant === "muted",
        },
        {
          "text-xs px-2.5 py-0.5": size === "sm",
          "text-sm px-3 py-1": size === "md",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
