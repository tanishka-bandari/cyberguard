import { cn } from "@/lib/cn";
import { SEVERITY_LABEL, riskLevel } from "@/lib/domain/incident";

const BAR: Record<string, string> = {
  CRITICAL: "bg-critical",
  HIGH: "bg-high",
  MEDIUM: "bg-medium",
  LOW: "bg-low",
};

// Number plus bar plus level word, so the level never depends on colour.
export function RiskMeter({ value, className }: { value: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, value));
  const level = riskLevel(pct);
  return (
    <div
      role="meter"
      aria-label="Risk score"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-valuetext={`${pct} out of 100, ${SEVERITY_LABEL[level].toLowerCase()} risk`}
      className={cn("flex min-w-24 items-center gap-2", className)}
    >
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-hover">
        <div className={cn("h-full rounded-full", BAR[level])} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-7 text-right font-mono text-xs tabular-nums">{pct}</span>
    </div>
  );
}
