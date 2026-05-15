import type { ReactNode } from "react";
import { getStatusTone } from "../../lib/status";
import { cn, titleCase } from "../../lib/utils";

const tones = {
  emerald:
    "bg-[var(--status-success-bg)] text-[var(--status-success-text)] ring-[var(--status-success-border)]",
  blue:
    "bg-[var(--status-info-bg)] text-[var(--status-info-text)] ring-[var(--status-info-border)]",
  amber:
    "bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] ring-[var(--status-warning-border)]",
  rose:
    "bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] ring-[var(--status-danger-border)]",
  slate:
    "bg-[var(--surface-secondary)] text-[var(--text-secondary)] ring-[var(--border-subtle)]"
};

export function Badge({
  
  value,
  children
}: {
  value?: string;
  children?: ReactNode;
}) {
  const display = value ? titleCase(value) : children;
  const tone = tones[getStatusTone(value ?? "")];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
        tone
      )}
    >
      {display}
    </span>
  );
}
