import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const controlClass = cn(
  "w-full rounded-md border border-border bg-surface px-3 text-sm text-fg",
  "placeholder:text-muted/70 disabled:opacity-60",
  "aria-[invalid=true]:border-critical",
);

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

// Label, hint and error text around one control. Ids: `${id}-hint`, `${id}-error`.
export function Field({ id, label, hint, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-critical-text">
          {error}
        </p>
      )}
    </div>
  );
}

export const describedBy = (id: string, hint?: string, error?: string) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;
