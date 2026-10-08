import {
  INCIDENT_TYPES,
  SEVERITIES,
  STATUSES,
  STATUS_GROUP,
  STATUS_GROUPS,
  TYPE_LABEL,
  type StatusGroup,
} from "@/lib/domain/incident";
import type { Incident, IncidentStatus, IncidentType, Severity } from "@/types/domain";

export const RANGES = { "24h": 24, "7d": 168, "30d": 720 } as const;
export type Range = keyof typeof RANGES;

export const UNASSIGNED = "unassigned";

// Mirrors the URL search params: ?severity=&status=&group=&q=&assignee=&range=&type=
export interface IncidentFilters {
  severity: Severity | null;
  status: IncidentStatus | null;
  group: StatusGroup | null;
  q: string;
  assignee: string | null; // a staff user id, or "unassigned"
  range: Range | null;
  type: IncidentType | null;
}

export const EMPTY_FILTERS: IncidentFilters = {
  severity: null,
  status: null,
  group: null,
  q: "",
  assignee: null,
  range: null,
  type: null,
};

export const FILTER_KEYS = Object.keys(EMPTY_FILTERS) as (keyof IncidentFilters)[];

const oneOf = <T extends string>(list: readonly T[], value: string | null): T | null =>
  list.find((item) => item === value) ?? null;

export function parseFilters(params: URLSearchParams): IncidentFilters {
  const assignee = params.get("assignee");
  return {
    severity: oneOf(SEVERITIES, params.get("severity")),
    status: oneOf(STATUSES, params.get("status")),
    group: oneOf(STATUS_GROUPS, params.get("group")),
    q: params.get("q") ?? "",
    assignee: assignee === UNASSIGNED || /^\d+$/.test(assignee ?? "") ? assignee : null,
    range: oneOf(Object.keys(RANGES) as Range[], params.get("range")),
    type: oneOf(INCIDENT_TYPES, params.get("type")),
  };
}

export const hasActiveFilters = (filters: IncidentFilters) =>
  FILTER_KEYS.some((key) => filters[key] !== EMPTY_FILTERS[key]);

function matchesQuery(incident: Incident, query: string): boolean {
  const needle = query.trim().toLowerCase().replace(/^#/, "");
  if (!needle) return true;
  return [
    String(incident.id),
    incident.title,
    incident.reporter.name,
    incident.assignee?.name ?? "",
    TYPE_LABEL[incident.type],
  ].some((field) => field.toLowerCase().includes(needle));
}

export function filterIncidents(
  incidents: Incident[],
  f: IncidentFilters,
  now: Date = new Date(),
): Incident[] {
  const since = f.range ? now.getTime() - RANGES[f.range] * 3_600_000 : null;
  return incidents.filter((i) => {
    if (f.severity && i.severity !== f.severity) return false;
    if (f.status && i.status !== f.status) return false;
    if (f.group && STATUS_GROUP[i.status] !== f.group) return false;
    if (f.type && i.type !== f.type) return false;
    if (since !== null && i.reportedAt.getTime() < since) return false;
    if (f.assignee === UNASSIGNED && i.assignee) return false;
    if (f.assignee && f.assignee !== UNASSIGNED && String(i.assignee?.id) !== f.assignee) return false;
    return matchesQuery(i, f.q);
  });
}
