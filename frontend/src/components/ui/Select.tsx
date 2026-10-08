import { useId, type SelectHTMLAttributes } from "react";
import { Field, controlClass, describedBy } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  error?: string;
}

export function Select({ label, hint, error, className, children, ...rest }: SelectProps) {
  const id = useId();
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(controlClass, "h-10", className)}
        {...rest}
      >
        {children}
      </select>
    </Field>
  );
}
