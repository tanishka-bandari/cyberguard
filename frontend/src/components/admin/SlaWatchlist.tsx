import Link from "next/link";
import Schedule from "@mui/icons-material/Schedule";
import WarningAmber from "@mui/icons-material/WarningAmber";
import { EmptyState } from "@/components/ui/EmptyState";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { SLA_HOURS } from "@/lib/domain/incident";
import { msUntilBreach, openIncidents } from "@/lib/domain/stats";
import { cn } from "@/lib/cn";
import type { Incident } from "@/types/domain";

const LIMIT = 8;
const HOUR_MS = 3_600_000;

function formatDuration(ms: number) {
  const minutes = Math.floor(Math.abs(ms) / 60_000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  if (days) return `${days}d ${hours}h`;
  return hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

function Timer({ left }: { left: number }) {
  const overdue = left < 0;
  const Icon = overdue ? WarningAmber : Schedule;
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium", overdue ? "text-critical-text" : "text-muted")}>
      <Icon fontSize="inherit" />
      {overdue ? `Overdue by ${formatDuration(left)}` : `${formatDuration(left)} left`}
    </span>
  );
}

// Open incidents ordered by how soon (or how long ago) they pass the policy deadline.
export function SlaWatchlist({ incidents, now }: { incidents: readonly Incident[]; now: Date }) {
  const rows = openIncidents(incidents)
    .map((incident) => ({ incident, left: msUntilBreach(incident, now) }))
    .sort((a, b) => a.left - b.left)
    .slice(0, LIMIT);

  if (rows.length === 0) return <EmptyState title="No open incidents" description="Nothing is waiting on an SLA deadline." />;

  return (
    <ul className="divide-y divide-border">
      {rows.map(({ incident, left }) => {
        const elapsed = 1 - left / (SLA_HOURS[incident.severity] * HOUR_MS);
        return (
          <li key={incident.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
            <SeverityBadge severity={incident.severity} />
            <div className="min-w-0 flex-1 basis-48">
              <Link href={`/incidents/${incident.id}`} className="block truncate text-sm font-medium hover:text-accent-text hover:underline">
                <span className="mr-2 font-mono text-xs text-muted">#{incident.id}</span>
                {incident.title}
              </Link>
              <div aria-hidden="true" className="mt-1.5 h-1 overflow-hidden rounded-full bg-hover">
                <div
                  className={cn("h-full rounded-full", left < 0 ? "bg-critical" : elapsed > 0.75 ? "bg-high" : "bg-info")}
                  style={{ width: `${Math.min(100, Math.max(0, elapsed * 100))}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-muted">{incident.assignee?.name ?? "Unassigned"}</span>
            <Timer left={left} />
          </li>
        );
      })}
    </ul>
  );
}
