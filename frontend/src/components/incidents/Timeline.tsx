"use client";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuditLog } from "@/hooks/useAuditLog";
import { formatDateTime } from "@/lib/format";

const ACTION_LABEL: Record<string, string> = {
  INCIDENT_CREATED: "Incident reported",
  STATUS_CHANGED: "Status changed",
  INCIDENT_ASSIGNED: "Assigned",
  INCIDENT_UNASSIGNED: "Unassigned",
  NOTE_ADDED: "Note added",
  EVIDENCE_UPLOADED: "Evidence uploaded",
};

const actionLabel = (action: string) =>
  ACTION_LABEL[action] ?? action.charAt(0) + action.slice(1).toLowerCase().replaceAll("_", " ");

export function Timeline({ incidentId }: { incidentId: number }) {
  const { data: entries, error, isLoading, mutate } = useAuditLog(incidentId);

  return (
    <Card title="Timeline">
      {isLoading ? (
        <Skeleton className="h-24" />
      ) : error ? (
        <ErrorState title="Could not load the timeline" error={error} onRetry={() => mutate()} />
      ) : entries && entries.length > 0 ? (
        <ol className="space-y-4 border-l border-border pl-4">
          {entries.map((entry) => (
            <li key={entry.id} className="relative">
              <span aria-hidden="true" className="absolute -left-[1.3125rem] top-1.5 size-2.5 rounded-full bg-accent" />
              <p className="text-sm font-medium">{actionLabel(entry.action)}</p>
              {entry.details && <p className="break-words text-sm text-muted">{entry.details}</p>}
              <p className="text-xs text-muted">
                {entry.actor.name} -{" "}
                <time dateTime={entry.createdAt.toISOString()}>{formatDateTime(entry.createdAt)}</time>
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState title="No activity recorded" />
      )}
    </Card>
  );
}
