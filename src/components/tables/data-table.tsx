import type { ReactNode } from "react";
import { Card } from "../common/card";

export function DataTable({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-[var(--border-subtle)] px-6 py-5">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p> : null}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </Card>
  );
}
