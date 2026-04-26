import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

export function buttonClass(
  variant: "primary" | "secondary" | "outline" | "ghost" | "danger" = "primary",
  size: "sm" | "md" | "lg" | "xl" = "md",
  className?: string
): string {
  return clsx(
    "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ink disabled:opacity-50 disabled:cursor-not-allowed",
    {
      "bg-gold text-ink hover:bg-gold-light focus:ring-gold shadow-lg shadow-gold/20 active:scale-[0.98]":
        variant === "primary",
      "bg-surface-raised text-text hover:bg-surface-high border border-border focus:ring-border":
        variant === "secondary",
      "border border-gold text-gold hover:bg-gold/10 focus:ring-gold":
        variant === "outline",
      "text-text-secondary hover:text-text hover:bg-surface-raised focus:ring-border":
        variant === "ghost",
      "bg-error text-white hover:bg-red-700 focus:ring-error":
        variant === "danger",
    },
    {
      "text-xs px-3 py-1.5 gap-1.5": size === "sm",
      "text-sm px-4 py-2 gap-2": size === "md",
      "text-base px-6 py-3 gap-2": size === "lg",
      "text-lg px-8 py-4 gap-2.5": size === "xl",
    },
    className
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClass(variant, size, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
