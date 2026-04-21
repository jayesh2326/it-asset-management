import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-[var(--text-on-emphasis)] shadow-[var(--shadow-soft)] hover:bg-brand-700 focus-visible:ring-[var(--focus-ring)]",
  secondary:
    "bg-[var(--surface-emphasis)] text-[var(--text-on-emphasis)] shadow-[var(--shadow-soft)] hover:opacity-95 focus-visible:ring-[var(--focus-ring)]",
  ghost:
    "bg-[var(--surface-primary)] text-[var(--text-secondary)] ring-1 ring-[var(--border-subtle)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] focus-visible:ring-[var(--focus-ring)]",
  danger:
    "bg-rose-600 text-[var(--text-on-emphasis)] shadow-[var(--shadow-soft)] hover:bg-rose-700 focus-visible:ring-[var(--status-danger-border)]"
};

export function Button({
  className,
  variant = "primary",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
