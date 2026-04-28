import type { ReactNode } from "react";

export function ChartTooltip({
  active,
  payload,
  label,
  formatter
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
  formatter?: (entry: { name?: string; value?: number; color?: string }) => ReactNode;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[var(--chart-tooltip-border)] bg-[var(--chart-tooltip-bg)] px-4 py-3 shadow-panel">
      {label ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          {label}
        </p>
      ) : null}
      <div className="mt-2 space-y-2 text-sm text-[var(--text-secondary)]">
        {payload.map((entry, index) => (
          <div key={`${entry.name}-${index}`} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color ?? "var(--chart-brand)" }}
              />
              <span>{entry.name}</span>
            </div>
            <span className="font-semibold text-[var(--text-primary)]">
              {formatter ? formatter(entry) : entry.value ?? 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
