import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  action?: ReactNode;
  flush?: boolean; // no inner padding, for tables
}

export function Card({ title, action, flush = false, className, children, ...rest }: CardProps) {
  return (
    <section className={cn("rounded-lg border border-border bg-panel", className)} {...rest}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          {action}
        </header>
      )}
      <div className={flush ? "" : "p-4"}>{children}</div>
    </section>
  );
}
