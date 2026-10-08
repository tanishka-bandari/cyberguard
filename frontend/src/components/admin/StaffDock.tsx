import { useMemo } from "react";
import { useDropTarget } from "@/components/admin/useDropTarget";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { isAssignable } from "@/lib/domain/incident";
import { workloadByStaff } from "@/lib/domain/stats";
import type { Incident, User } from "@/types/domain";

interface StaffDockProps {
  staff: readonly User[];
  incidents: readonly Incident[];
  dragging: Incident | null;
  canAssign: boolean;
  onDrop: (person: User) => void;
}

interface StaffChipProps {
  person: User;
  open: number;
  isTarget: boolean;
  onDrop: (person: User) => void;
}

function StaffChip({ person, open, isTarget, onDrop }: StaffChipProps) {
  const { isOver, handlers } = useDropTarget(isTarget, () => onDrop(person));
  return (
    <li
      {...handlers}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-md border bg-surface px-3 py-2 motion-safe:transition-colors",
        isTarget ? "border-dashed border-accent" : "border-border",
        isOver && "bg-accent/10",
      )}
    >
      <Avatar name={person.name} />
      <div className="text-sm">
        <p className="font-medium leading-tight">{person.name}</p>
        <p className="text-xs text-muted">
          {open} open, {person.role.toLowerCase()}
        </p>
      </div>
    </li>
  );
}

export function StaffDock({ staff, incidents, dragging, canAssign, onDrop }: StaffDockProps) {
  const workloads = useMemo(() => workloadByStaff(incidents, staff), [incidents, staff]);

  return (
    <ul className="flex gap-2 overflow-x-auto pb-1">
      {workloads.map(({ person, open }) => (
        <StaffChip
          key={person.id}
          person={person}
          open={open}
          isTarget={canAssign && !!dragging && isAssignable(dragging) && dragging.assignee?.id !== person.id}
          onDrop={onDrop}
        />
      ))}
    </ul>
  );
}
