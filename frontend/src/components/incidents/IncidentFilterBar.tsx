"use client";

import { useEffect, useRef, useState } from "react";
import Search from "@mui/icons-material/Search";
import { Button } from "@/components/ui/Button";
import { Chips } from "@/components/ui/Chips";
import { Input } from "@/components/ui/Input";
import { TypeSelect } from "@/components/incidents/TypeSelect";
import { Select } from "@/components/ui/Select";
import { useSession } from "@/hooks/useSession";
import { UNASSIGNED, type IncidentFilters, type Range } from "@/lib/domain/filters";
import { GROUP_LABEL, SEVERITY_OPTIONS, STATUS_GROUPS } from "@/lib/domain/incident";

const QUERY_DEBOUNCE_MS = 250;

const RANGE_LABEL: Record<Range, string> = { "24h": "Last 24 hours", "7d": "Last 7 days", "30d": "Last 30 days" };

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

  // The box keeps its own text and writes it to the URL after a pause. A URL value we
  // wrote ourselves is ignored when it arrives late; anything else (clear, global
  // search) replaces the text.
  const [query, setQuery] = useState(filters.q);
  const pushed = useRef<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latest = useRef({ onChange, q: filters.q });
  useEffect(() => {
    latest.current = { onChange, q: filters.q };
  });

  useEffect(() => {
    const own = pushed.current.indexOf(filters.q);
    if (own >= 0) {
      pushed.current.splice(0, own + 1);
      return;
    }
    pushed.current = [];
    clearTimeout(timer.current);
    setQuery(filters.q);
  }, [filters.q]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleQuery = (value: string) => {
    setQuery(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (value === latest.current.q) return;
      pushed.current.push(value);
      latest.current.onChange({ q: value });
    }, QUERY_DEBOUNCE_MS);
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
        <TypeSelect value={filters.type} onChange={(type) => onChange({ type })} allLabel="All types" />
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
