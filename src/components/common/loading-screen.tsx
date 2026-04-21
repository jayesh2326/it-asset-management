export function LoadingScreen({ label = "Loading application..." }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-8 py-6 text-center text-[var(--text-primary)] shadow-panel">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--border-subtle)] border-t-[var(--chart-brand)]" />
        <p className="mt-4 text-sm text-[var(--text-muted)]">{label}</p>
      </div>
    </div>
  );
}
