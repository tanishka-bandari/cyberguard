import Link from "next/link";
import { SlaTimer } from "@/components/admin/SlaTimer";
import { EmptyState } from "@/components/ui/EmptyState";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { SLA_HOURS } from "@/lib/domain/incident";
import { msUntilBreach, openIncidents } from "@/lib/domain/stats";
import { cn } from "@/lib/cn";
import type { Incident } from "@/types/domain";

const LIMIT = 8;
const HOUR_MS = 3_600_000;

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
            <SlaTimer left={left} severity={incident.severity} />
          </li>
        );
      })}
    </ul>
  );
}
