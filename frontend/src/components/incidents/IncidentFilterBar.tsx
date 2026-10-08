"use client";

import { useEffect, useRef, useState } from "react";
import Search from "@mui/icons-material/Search";
import { Button } from "@/components/ui/Button";
import { Chips } from "@/components/ui/Chips";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useSession } from "@/hooks/useSession";
import { UNASSIGNED, type IncidentFilters, type Range } from "@/lib/domain/filters";
import {
  GROUP_LABEL,
  INCIDENT_TYPES,
  SEVERITIES,
  SEVERITY_LABEL,
  STATUS_GROUPS,
  TYPE_LABEL,
} from "@/lib/domain/incident";
import type { IncidentType } from "@/types/domain";

const RANGE_LABEL: Record<Range, string> = { "24h": "Last 24 hours", "7d": "Last 7 days", "30d": "Last 30 days" };

const SEVERITY_OPTIONS = SEVERITIES.map((s) => ({ value: s, label: SEVERITY_LABEL[s] }));
const STATUS_OPTIONS = STATUS_GROUPS.map((g) => ({ value: g, label: GROUP_LABEL[g] }));

interface IncidentFilterBarProps {
  filters: IncidentFilters;
  onChange: (patch: Partial<IncidentFilters>) => void;
  onClear: () => void;
  isFiltered: boolean;
  shown: number;
  total: number;
}

export function IncidentFilterBar({ filters, onChange, onClear, isFiltered, shown, total }: IncidentFilterBarProps) {
  const { user } = useSession();

  // The box keeps its own text so typing never waits for the URL round trip;
  // it only adopts the URL value when something else (clear, global search) changed it.
  const [query, setQuery] = useState(filters.q);
  const typed = useRef(filters.q);
  useEffect(() => {
    if (filters.q !== typed.current) {
      typed.current = filters.q;
      setQuery(filters.q);
    }
  }, [filters.q]);

  const handleQuery = (value: string) => {
    typed.current = value;
    setQuery(value);
    onChange({ q: value });
  };

  const assigneeOptions = [
    ...(user ? [{ value: String(user.id), label: "Assigned to me" }] : []),
    { value: UNASSIGNED, label: "Unassigned" },
  ];

  return (
    <div className="mb-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-3 lg:col-span-1">
          <Input
            type="search"
            label="Search"
            placeholder="Title, ID, reporter, assignee"
            value={query}
            onChange={(e) => handleQuery(e.target.value)}
            trailing={<Search fontSize="small" className="mr-2 text-muted" />}
          />
        </div>
        <Select
          label="Type"
          value={filters.type ?? ""}
          onChange={(e) => onChange({ type: (e.target.value || null) as IncidentType | null })}
        >
          <option value="">All types</option>
          {INCIDENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </Select>
        <Select
          label="Reported"
          value={filters.range ?? ""}
          onChange={(e) => onChange({ range: (e.target.value || null) as Range | null })}
        >
          <option value="">Any time</option>
          {(Object.keys(RANGE_LABEL) as Range[]).map((r) => (
            <option key={r} value={r}>
              {RANGE_LABEL[r]}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <Chips label="Assignment" options={assigneeOptions} value={filters.assignee} onChange={(assignee) => onChange({ assignee })} allLabel="Anyone" />
        <Chips label="Severity" options={SEVERITY_OPTIONS} value={filters.severity} onChange={(severity) => onChange({ severity })} allLabel="Any severity" />
        <Chips label="Status" options={STATUS_OPTIONS} value={filters.group} onChange={(group) => onChange({ group })} allLabel="Any status" />
      </div>
      <div className="flex items-center gap-3 text-sm text-muted" aria-live="polite">
        <span>
          {isFiltered ? `${shown} of ${total} incidents` : `${total} ${total === 1 ? "incident" : "incidents"}`}
        </span>
        {isFiltered && (
          <Button size="sm" variant="ghost" onClick={onClear}>
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
