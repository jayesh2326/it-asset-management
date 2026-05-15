import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes
} from "react";
import { cn } from "../../lib/utils";

export function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text-secondary)]">
      <span>{label}</span>
      {children}
      {error ? (
        <span className="text-xs text-[var(--status-danger-text)]">{error}</span>
      ) : null}
    </label>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => (
    <input
      ref={ref}
      {...props}
      className={cn(
        "h-11 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3 text-sm text-[var(--text-primary)] outline-none ring-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-all duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:shadow-[var(--shadow-glow-soft)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
        props.className
      )}
    />
  )
);
Input.displayName = "Input";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>((props, ref) => (
  <select
    ref={ref}
    {...props}
    className={cn(
      "h-11 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3 text-sm text-[var(--text-primary)] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-all duration-200 focus:border-[var(--accent-primary)] focus:shadow-[var(--shadow-glow-soft)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
      props.className
    )}
  />
));
Select.displayName = "Select";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>((props, ref) => (
  <textarea
    ref={ref}
    {...props}
    className={cn(
      "min-h-28 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-all duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:shadow-[var(--shadow-glow-soft)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
      props.className
    )}
  />
));
Textarea.displayName = "Textarea";
