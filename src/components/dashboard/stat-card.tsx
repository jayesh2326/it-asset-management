import type { ReactNode } from "react";
import { Card } from "../common/card";

export function StatCard({
  label,
  value,
  hint,
  icon
}: {
  label: string;
  value: number;
  hint: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="border-[var(--nav-border)] bg-[var(--surface-emphasis)] text-[var(--text-on-emphasis)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--nav-text-secondary)]">{label}</p>
          <p className="mt-3 text-3xl font-semibold">{value}</p>
        </div>
        <div className="rounded-2xl bg-[var(--nav-surface-highlight)] p-3">{icon}</div>
      </div>
      <p className="mt-4 text-sm text-[var(--nav-text-secondary)]">{hint}</p>
    </Card>
  );
}
