import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  href?: string; // makes the whole card a link, for drill-down
  className?: string;
}

export function KpiCard({ label, value, hint, icon, href, className }: KpiCardProps) {
  const body = (
    <>
      <div className="flex items-center justify-between text-sm text-muted">
        <span>{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="mt-2 text-3xl font-semibold tabular-nums">{value}</div>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </>
  );
  const base = cn("block rounded-lg border border-border bg-panel p-4", className);
  if (!href) return <div className={base}>{body}</div>;
  return (
    <Link href={href} className={cn(base, "transition-colors hover:border-accent")}>
      {body}
    </Link>
  );
}
