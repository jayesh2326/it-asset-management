import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 text-[var(--text-primary)] shadow-panel",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
