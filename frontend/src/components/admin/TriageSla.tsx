import AccessTime from "@mui/icons-material/AccessTime";
import WarningAmber from "@mui/icons-material/WarningAmber";
import { cn } from "@/lib/cn";
import { SLA_HOURS, isOpen, isSlaBreached, slaDeadline } from "@/lib/domain/incident";
import { formatDuration } from "@/lib/format";
import type { Incident } from "@/types/domain";

export function TriageSla({ incident, now }: { incident: Incident; now: Date }) {
  if (!isOpen(incident)) return null;
  const breached = isSlaBreached(incident, now);
  const remaining = slaDeadline(incident).getTime() - now.getTime();
  const Icon = breached ? WarningAmber : AccessTime;
  return (
    <span
      title={`SLA for ${incident.severity.toLowerCase()} severity: ${SLA_HOURS[incident.severity]} hours`}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium",
        breached ? "text-critical-text" : "text-muted",
      )}
    >
      <Icon fontSize="inherit" />
      {breached ? `SLA breached ${formatDuration(remaining)} ago` : `${formatDuration(remaining)} left`}
    </span>
  );
}
