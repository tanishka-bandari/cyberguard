import Schedule from "@mui/icons-material/Schedule";
import WarningAmber from "@mui/icons-material/WarningAmber";
import { cn } from "@/lib/cn";
import { SLA_HOURS } from "@/lib/domain/incident";
import { formatDuration } from "@/lib/format";
import type { Severity } from "@/types/domain";

// `left` is msUntilBreach: positive while time remains, negative once overdue.
export function SlaTimer({ left, severity }: { left: number; severity: Severity }) {
  const overdue = left < 0;
  const Icon = overdue ? WarningAmber : Schedule;
  return (
    <span
      title={`SLA for ${severity.toLowerCase()} severity: ${SLA_HOURS[severity]} hours`}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium",
        overdue ? "text-critical-text" : "text-muted",
      )}
    >
      <Icon fontSize="inherit" />
      {overdue ? `Overdue by ${formatDuration(left)}` : `${formatDuration(left)} left`}
    </span>
  );
}
