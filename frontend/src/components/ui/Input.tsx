import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { Field, controlClass, describedBy } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  trailing?: ReactNode; // for example a show/hide password button
}

export function Input({ label, hint, error, trailing, className, ...rest }: InputProps) {
  const id = useId();
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={cn(controlClass, "h-10", !!trailing && "pr-16", className)}
          {...rest}
        />
        {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
      </div>
    </Field>
  );
}
