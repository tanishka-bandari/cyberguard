import { cn } from "@/lib/cn";

interface ProgressProps {
  value: number; // 0-100
  label: string; // read by screen readers
  className?: string;
}

export function Progress({ value, label, className }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-hover", className)}
    >
      <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${pct}%` }} />
    </div>
  );
}
