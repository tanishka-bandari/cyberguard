"use client";

import { Select } from "@/components/ui/Select";
import { useIncidents } from "@/hooks/useIncidents";
import { useStaff } from "@/hooks/useStaff";
import { isAssignable, isOpen } from "@/lib/domain/incident";
import type { Incident, Role, User } from "@/types/domain";

const GROUPS: { role: Role; label: string }[] = [
  { role: "ADMIN", label: "Admins" },
  { role: "ANALYST", label: "Analysts" },
];

interface AssignSelectProps {
  incident: Incident;
  disabled: boolean;
  onAssign: (userId: number) => void;
  onUnassign: () => void;
}

export function AssignSelect({ incident, disabled, onAssign, onUnassign }: AssignSelectProps) {
  const { data: staff, error } = useStaff();
  const { data: incidents } = useIncidents();

  const openCount = (member: User) =>
    (incidents ?? []).filter((i) => isOpen(i) && i.assignee?.id === member.id).length;

  const hint = !isAssignable(incident)
    ? "Reopen this incident first to change the assignee."
    : staff
      ? "Number of open incidents each person already has."
      : "Loading staff...";

  return (
    <Select
      label="Assignee"
      value={incident.assignee?.id ?? ""}
      disabled={disabled || !staff || !isAssignable(incident)}
      error={error ? "Could not load the staff list" : undefined}
      hint={hint}
      onChange={(e) => (e.target.value ? onAssign(Number(e.target.value)) : onUnassign())}
    >
      <option value="">Unassigned</option>
      {GROUPS.map(({ role, label }) => (
        <optgroup key={role} label={label}>
          {(staff ?? [])
            .filter((member) => member.role === role)
            .map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({openCount(member)} open)
              </option>
            ))}
        </optgroup>
      ))}
    </Select>
  );
}
