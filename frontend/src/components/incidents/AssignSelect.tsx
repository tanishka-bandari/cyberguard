"use client";

import { useMemo } from "react";
import { Select } from "@/components/ui/Select";
import { useIncidents } from "@/hooks/useIncidents";
import { useStaff } from "@/hooks/useStaff";
import { isAssignable } from "@/lib/domain/incident";
import { workloadByStaff } from "@/lib/domain/stats";
import type { Incident, Role } from "@/types/domain";

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

  const workloads = useMemo(() => workloadByStaff(incidents ?? [], staff ?? []), [incidents, staff]);

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
          {workloads
            .filter(({ person }) => person.role === role)
            .map(({ person, open }) => (
              <option key={person.id} value={person.id}>
                {person.name} ({open} open)
              </option>
            ))}
        </optgroup>
      ))}
    </Select>
  );
}
