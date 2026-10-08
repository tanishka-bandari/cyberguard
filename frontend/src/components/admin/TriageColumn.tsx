import { TriageCard } from "@/components/admin/TriageCard";
import { useDropTarget } from "@/components/admin/useDropTarget";
import { cn } from "@/lib/cn";
import { STATUS_LABEL, canMoveTo } from "@/lib/domain/incident";
import type { Incident, IncidentStatus } from "@/types/domain";

interface TriageColumnProps {
  status: IncidentStatus;
  incidents: readonly Incident[];
  now: Date;
  dragging: Incident | null;
  canMove: boolean;
  canDrag: boolean;
  onDrop: (status: IncidentStatus) => void;
  onDragStart: (incident: Incident) => void;
  onDragEnd: () => void;
  onOpenActions: (incident: Incident) => void;
}

export function TriageColumn({
  status,
  incidents,
  now,
  dragging,
  canMove,
  canDrag,
  onDrop,
  onDragStart,
  onDragEnd,
  onOpenActions,
}: TriageColumnProps) {
  const isTarget = canMove && !!dragging && dragging.status !== status && canMoveTo(dragging, status);
  const { isOver, handlers } = useDropTarget(isTarget, () => onDrop(status));

  return (
    <section
      aria-label={`${STATUS_LABEL[status]}, ${incidents.length} incidents`}
      {...handlers}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-lg border bg-panel motion-safe:transition-colors",
        isTarget ? "border-dashed border-accent" : "border-border",
        isOver && "bg-accent/10",
      )}
    >
      <header className="flex items-center justify-between border-b border-border px-3 py-2">
        <h3 className="text-sm font-semibold">{STATUS_LABEL[status]}</h3>
        <span className="rounded-full bg-hover px-2 text-xs font-medium tabular-nums">
          {incidents.length}
        </span>
      </header>
      <ul className="max-h-[60vh] min-h-24 space-y-2 overflow-y-auto p-2">
        {incidents.map((incident) => (
          <li key={incident.id}>
            <TriageCard
              incident={incident}
              now={now}
              draggable={canDrag}
              isDragging={dragging?.id === incident.id}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onOpenActions={onOpenActions}
            />
          </li>
        ))}
        {incidents.length === 0 && <li className="px-1 py-4 text-center text-xs text-muted">No incidents</li>}
      </ul>
    </section>
  );
}
