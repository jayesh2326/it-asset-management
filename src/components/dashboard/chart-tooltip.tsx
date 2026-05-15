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
    <div className="rounded-[14px] border border-white/10 bg-[#0F0F0F]/95 px-4 py-3 shadow-[0_20px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
      {label ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">
          {label}
        </p>
      ) : null}
      <div className="mt-2 space-y-2 text-sm text-[#D1D5DB]">
        {payload.map((entry, index) => (
          <div key={`${entry.name}-${index}`} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color ?? "var(--chart-brand)" }}
              />
              <span>{entry.name}</span>
            </div>
            <span className="font-semibold text-white">
              {formatter ? formatter(entry) : entry.value ?? 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
