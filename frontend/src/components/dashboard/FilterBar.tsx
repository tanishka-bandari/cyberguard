"use client";

import type { ReactNode } from "react";
import { DASHBOARD_RANGES, type DashboardRange, type StatusScope, useDashboardFilters } from "@/components/dashboard/useDashboardFilters";
import { Button } from "@/components/ui/Button";
import { Chips } from "@/components/ui/Chips";
import { Select } from "@/components/ui/Select";
import { UNASSIGNED } from "@/lib/domain/filters";
import { GROUP_LABEL, INCIDENT_TYPES, SEVERITIES, SEVERITY_LABEL, STATUS_GROUPS, TYPE_LABEL } from "@/lib/domain/incident";
import type { IncidentType } from "@/types/domain";

const SCOPE_OPTIONS: { value: StatusScope; label: string }[] = [
  { value: "open", label: "Open" },
  ...STATUS_GROUPS.map((g) => ({ value: g, label: GROUP_LABEL[g] })),
];

const SEVERITY_OPTIONS = SEVERITIES.map((s) => ({ value: s, label: SEVERITY_LABEL[s] }));

const ASSIGNEE_OPTIONS = [
  { value: "me", label: "Assigned to me" },
  { value: UNASSIGNED, label: "Unassigned" },
] as const;

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      {children}
    </div>
  );
}

interface FilterBarProps {
  view: ReturnType<typeof useDashboardFilters>;
  userId: number;
}

// One row above the charts; everything below it is scoped by these controls.
export function FilterBar({ view, userId }: FilterBarProps) {
  const { filters, range, scope, update, setScope, isFiltered, clear } = view;
  const mine = String(userId);
  const assignee = filters.assignee === mine ? "me" : filters.assignee === UNASSIGNED ? UNASSIGNED : null;

  return (
    <div className="mb-6 flex flex-wrap items-end gap-x-6 gap-y-4 rounded-lg border border-border bg-panel p-4">
      <div className="w-full sm:w-44">
        <Select label="Date range" value={range.value} onChange={(e) => update({ range: e.target.value as DashboardRange })}>
          {DASHBOARD_RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="w-full sm:w-52">
        <Select
          label="Type"
          value={filters.type ?? ""}
          onChange={(e) => update({ type: (e.target.value || null) as IncidentType | null })}
        >
          <option value="">All types</option>
          {INCIDENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </Select>
      </div>
      <Group label="Severity">
        <Chips label="Severity" options={SEVERITY_OPTIONS} value={filters.severity} onChange={(severity) => update({ severity })} />
      </Group>
      <Group label="Status">
        <Chips label="Status" options={SCOPE_OPTIONS} value={scope} onChange={setScope} />
      </Group>
      <Group label="Assignment">
        <Chips
          label="Assignment"
          allLabel="Anyone"
          options={ASSIGNEE_OPTIONS}
          value={assignee}
          onChange={(value) => update({ assignee: value === "me" ? mine : value })}
        />
      </Group>
      {isFiltered && (
        <Button variant="ghost" size="sm" onClick={clear}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
