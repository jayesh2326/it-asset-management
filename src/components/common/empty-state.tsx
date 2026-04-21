import { Card } from "./card";

export function EmptyState({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed bg-[var(--surface-secondary)] text-center">
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{description}</p>
    </Card>
  );
}
