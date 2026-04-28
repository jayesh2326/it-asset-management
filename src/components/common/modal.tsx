import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

export function Modal({
  open,
  title,
  description,
  onClose,
  children
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--overlay-backdrop)] px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 text-[var(--text-primary)] shadow-panel ring-1 ring-inset ring-[var(--accent-primary-faint)] backdrop-blur-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
            ) : null}
          </div>
          <Button type="button" variant="ghost" className="px-3" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
