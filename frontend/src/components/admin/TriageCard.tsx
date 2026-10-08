import Link from "next/link";
import MoreVert from "@mui/icons-material/MoreVert";
import { SlaTimer } from "@/components/admin/SlaTimer";
import { Avatar } from "@/components/ui/Avatar";
import { RiskMeter } from "@/components/ui/RiskMeter";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { cn } from "@/lib/cn";
import { isOpen } from "@/lib/domain/incident";
import { msUntilBreach } from "@/lib/domain/stats";
import type { Incident } from "@/types/domain";

interface TriageCardProps {
  incident: Incident;
  now: Date;
  draggable: boolean;
  isDragging: boolean;
  onDragStart: (incident: Incident) => void;
  onDragEnd: () => void;
  onOpenActions: (incident: Incident) => void;
}

export function TriageCard({
  incident,
  now,
  draggable,
  isDragging,
  onDragStart,
  onDragEnd,
  onOpenActions,
}: TriageCardProps) {
  return (
    <article
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", String(incident.id)); // Firefox refuses to drag without data
        e.dataTransfer.effectAllowed = "move";
        onDragStart(incident);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "space-y-2 rounded-md border border-border bg-surface p-3 text-sm",
        draggable && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted">#{incident.id}</span>
          <SeverityBadge severity={incident.severity} />
        </span>
        <button
          type="button"
          aria-label={`Actions for incident ${incident.id}`}
          onClick={() => onOpenActions(incident)}
          className="grid size-8 place-items-center rounded-md text-lg text-muted hover:bg-hover hover:text-fg"
        >
          <MoreVert fontSize="inherit" />
        </button>
      </div>
      <Link
        href={`/incidents/${incident.id}`}
        draggable={false}
        className="block font-medium hover:text-accent-text hover:underline"
      >
        {incident.title}
      </Link>
      <RiskMeter value={incident.riskScore} />
      <div className="flex items-center justify-between gap-2">
        {incident.assignee ? (
          <span className="flex min-w-0 items-center gap-1.5 text-xs">
            <Avatar name={incident.assignee.name} className="size-6 text-[10px]" />
            <span className="truncate">{incident.assignee.name}</span>
          </span>
        ) : (
          <span className="text-xs text-muted">Unassigned</span>
        )}
        {isOpen(incident) && <SlaTimer left={msUntilBreach(incident, now)} severity={incident.severity} />}
      </div>
    </article>
  );
}
