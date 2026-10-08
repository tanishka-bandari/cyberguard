"use client";

import { useMemo, useState } from "react";
import { StaffDock } from "@/components/admin/StaffDock";
import { TriageActionsDialog } from "@/components/admin/TriageActionsDialog";
import { useTriageActions } from "@/components/admin/TriageActions";
import { TriageColumn } from "@/components/admin/TriageColumn";
import { useNow } from "@/components/dashboard/useNow";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useIncidents } from "@/hooks/useIncidents";
import { useSession } from "@/hooks/useSession";
import { useStaff } from "@/hooks/useStaff";
import { can } from "@/lib/auth/permissions";
import { STATUSES, severityRank } from "@/lib/domain/incident";
import type { Incident, IncidentStatus, User } from "@/types/domain";

export function TriageBoard() {
  const { user } = useSession();
  const incidentsQuery = useIncidents();
  const staffQuery = useStaff();
  const actions = useTriageActions();

  const [showClosed, setShowClosed] = useState(false);
  const [dragging, setDragging] = useState<Incident | null>(null);
  const [menuId, setMenuId] = useState<number | null>(null);
  const now = useNow();

  const incidents = incidentsQuery.data;
  const canMove = can(user, "incident:changeStatus");
  const canAssign = can(user, "incident:assign");
  const statuses = showClosed ? STATUSES : STATUSES.filter((s) => s !== "CLOSED");

  const byStatus = useMemo(() => {
    const groups = new Map<IncidentStatus, Incident[]>(STATUSES.map((s) => [s, []]));
    for (const incident of incidents ?? []) groups.get(incident.status)?.push(incident);
    for (const list of groups.values()) {
      list.sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || b.riskScore - a.riskScore);
    }
    return groups;
  }, [incidents]);

  const dropOnStatus = (status: IncidentStatus) => {
    if (dragging) void actions.move(dragging, status);
    setDragging(null);
  };

  const dropOnPerson = (person: User) => {
    if (dragging) void actions.assign(dragging, person);
    setDragging(null);
  };

  if (incidentsQuery.error) {
    return <ErrorState error={incidentsQuery.error} onRetry={() => void incidentsQuery.mutate()} />;
  }
  if (!incidents) {
    return (
      <div className="flex gap-3 overflow-x-auto" aria-busy="true" aria-label="Loading incidents">
        {[0, 1, 2, 3].map((n) => (
          <Skeleton key={n} className="h-72 w-72 shrink-0" />
        ))}
      </div>
    );
  }
  if (incidents.length === 0) {
    return <EmptyState title="No incidents yet" description="Reported incidents appear here as soon as they arrive." />;
  }

  return (
    <div className="space-y-4">
      <Card title="Staff">
        <p className="mb-3 text-sm text-muted">
          Drag a card onto a column to change its status or onto a person to assign it. On touch or with a
          keyboard, use the actions button on each card.
        </p>
        {staffQuery.error ? (
          <ErrorState title="Could not load staff" error={staffQuery.error} onRetry={() => void staffQuery.mutate()} />
        ) : !staffQuery.data ? (
          <Skeleton className="h-14" />
        ) : (
          <StaffDock
            staff={staffQuery.data}
            incidents={incidents}
            dragging={dragging}
            canAssign={canAssign}
            onDrop={dropOnPerson}
          />
        )}
      </Card>

      <label className="flex w-fit items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={showClosed}
          onChange={(e) => setShowClosed(e.target.checked)}
          className="size-4 accent-accent"
        />
        Show closed
      </label>

      <div className="flex items-start gap-3 overflow-x-auto pb-2">
        {statuses.map((status) => (
          <TriageColumn
            key={status}
            status={status}
            incidents={byStatus.get(status) ?? []}
            now={now}
            dragging={dragging}
            canMove={canMove}
            canDrag={canMove || canAssign}
            onDrop={dropOnStatus}
            onDragStart={setDragging}
            onDragEnd={() => setDragging(null)}
            onOpenActions={(incident) => setMenuId(incident.id)}
          />
        ))}
      </div>

      <TriageActionsDialog
        incident={incidents.find((i) => i.id === menuId) ?? null}
        staff={staffQuery.data ?? []}
        canMove={canMove}
        canAssign={canAssign}
        onClose={() => setMenuId(null)}
        onMove={(incident, status) => void actions.move(incident, status)}
        onAssign={(incident, person) => void actions.assign(incident, person)}
        onUnassign={(incident) => void actions.unassign(incident)}
      />
    </div>
  );
}
