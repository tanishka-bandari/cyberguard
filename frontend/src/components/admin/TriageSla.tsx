import AccessTime from "@mui/icons-material/AccessTime";
import WarningAmber from "@mui/icons-material/WarningAmber";
import { cn } from "@/lib/cn";
import { SLA_HOURS, isOpen, isSlaBreached, slaDeadline } from "@/lib/domain/incident";
import type { Incident } from "@/types/domain";

function duration(ms: number): string {
  const minutes = Math.floor(Math.abs(ms) / 60_000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  if (days) return `${days}d ${hours}h`;
  if (hours) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

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
      {breached ? `SLA breached ${duration(remaining)} ago` : `${duration(remaining)} left`}
    </span>
  );
}
