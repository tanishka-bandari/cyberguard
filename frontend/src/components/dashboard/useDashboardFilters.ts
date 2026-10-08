"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useReplaceParams } from "@/hooks/useReplaceParams";
import { EMPTY_FILTERS, FILTER_KEYS, applyFilterPatch, filterIncidents, parseFilters, type IncidentFilters } from "@/lib/domain/filters";
import { STATUS_GROUPS, isOpen, type StatusGroup } from "@/lib/domain/incident";
import type { Incident } from "@/types/domain";

// The dashboard's own date ranges (the shared filters only know 24h/7d/30d), plus an
// "open" scope that spans the three unsolved status groups.
export const DASHBOARD_RANGES = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "all", label: "All time", days: null },
] as const;

export type DashboardRange = (typeof DASHBOARD_RANGES)[number]["value"];
export type StatusScope = "open" | StatusGroup;

export interface DashboardPatch extends Omit<Partial<IncidentFilters>, "range"> {
  range?: DashboardRange;
  open?: boolean;
}

// URL-backed filter state for /dashboard. Uses useSearchParams, so wrap the page in <Suspense>.
export function useDashboardFilters() {
  const pathname = usePathname();
  const replaceParams = useReplaceParams();
  const query = useSearchParams().toString();

  const params = useMemo(() => new URLSearchParams(query), [query]);
  const filters = useMemo(() => parseFilters(params), [params]);
  const range = DASHBOARD_RANGES.find((r) => r.value === params.get("range")) ?? DASHBOARD_RANGES[1];
  const openOnly = params.get("open") === "1";
  const scope: StatusScope | null = openOnly ? "open" : filters.group;

  const update = useCallback(
    (patch: DashboardPatch) => {
      const { range: nextRange, open, ...filterPatch } = patch;
      const next = applyFilterPatch(params, filterPatch);
      if (nextRange) next.set("range", nextRange);
      if (open !== undefined) {
        if (open) next.set("open", "1");
        else next.delete("open");
      }
      replaceParams(next);
    },
    [params, replaceParams],
  );

  const setScope = useCallback(
    (value: StatusScope | null) => {
      const group = value && STATUS_GROUPS.includes(value as StatusGroup) ? (value as StatusGroup) : null;
      update({ group, open: value === "open" });
    },
    [update],
  );

  // A link to the dashboard in the current range with only the given filters applied.
  const hrefFor = (extra: Record<string, string> = {}) =>
    `${pathname}?${new URLSearchParams({ range: range.value, ...extra })}`;

  const matches = useCallback(
    (list: readonly Incident[]) =>
      filterIncidents([...list], { ...filters, range: null }).filter((i) => !openOnly || isOpen(i)),
    [filters, openOnly],
  );

  const isFiltered = openOnly || FILTER_KEYS.some((k) => k !== "range" && filters[k] !== EMPTY_FILTERS[k]);
  const clear = useCallback(
    () => update({ severity: null, status: null, group: null, type: null, assignee: null, q: "", open: false }),
    [update],
  );

  return { filters, range, scope, update, setScope, hrefFor, matches, isFiltered, clear };
}
