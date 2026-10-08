import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { isOpen } from "@/lib/domain/incident";
import type { Incident, User } from "@/types/domain";

interface StaffDockProps {
  staff: readonly User[];
  incidents: readonly Incident[];
  dragging: Incident | null;
  canAssign: boolean;
  onDrop: (person: User) => void;
}

export function StaffDock({ staff, incidents, dragging, canAssign, onDrop }: StaffDockProps) {
  const [overId, setOverId] = useState<number | null>(null);
  const openCount = (id: number) => incidents.filter((i) => i.assignee?.id === id && isOpen(i)).length;

  return (
    <ul className="flex gap-2 overflow-x-auto pb-1">
      {staff.map((person) => {
        const isTarget =
          canAssign && !!dragging && isOpen(dragging) && dragging.assignee?.id !== person.id;
        return (
          <li
            key={person.id}
            onDragOver={(e) => {
              if (!isTarget) return;
              e.preventDefault();
              setOverId(person.id);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOverId(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setOverId(null);
              if (isTarget) onDrop(person);
            }}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md border bg-surface px-3 py-2 motion-safe:transition-colors",
              isTarget ? "border-dashed border-accent" : "border-border",
              isTarget && overId === person.id && "bg-accent/10",
            )}
          >
            <Avatar name={person.name} />
            <div className="text-sm">
              <p className="font-medium leading-tight">{person.name}</p>
              <p className="text-xs text-muted">
                {openCount(person.id)} open, {person.role.toLowerCase()}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
