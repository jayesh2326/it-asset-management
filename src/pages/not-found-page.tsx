import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4 text-[var(--text-primary)]">
      <div className="rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-10 py-12 text-center shadow-panel">
        <p className="text-sm uppercase tracking-[0.22em] text-[var(--text-muted)]">404</p>
        <h1 className="mt-4 text-4xl font-semibold">Page not found</h1>
        <p className="mt-3 text-[var(--text-secondary)]">
          The page you tried to open does not exist in this workspace.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Return to homepage
        </Link>
      </div>
    </div>
  );
}
