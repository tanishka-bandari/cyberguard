import { useId, type TextareaHTMLAttributes } from "react";
import { Field, controlClass, describedBy } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, className, rows = 4, ...rest }: TextareaProps) {
  const id = useId();
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(controlClass, "py-2", className)}
        {...rest}
      />
    </Field>
  );
}
