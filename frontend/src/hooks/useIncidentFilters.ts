"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  EMPTY_FILTERS,
  FILTER_KEYS,
  filterIncidents,
  hasActiveFilters,
  parseFilters,
  type IncidentFilters,
} from "@/lib/domain/filters";
import type { Incident } from "@/types/domain";

// Filter state lives in the URL so views can be shared and the back button works.
// Uses useSearchParams, so the calling page must be wrapped in <Suspense>.
export function useIncidentFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = useMemo(() => parseFilters(new URLSearchParams(params.toString())), [params]);

  const setFilters = useCallback(
    (patch: Partial<IncidentFilters>) => {
      const next = new URLSearchParams(params.toString());
      for (const key of FILTER_KEYS) {
        if (!(key in patch)) continue;
        const value = patch[key];
        if (value === null || value === undefined || value === "") next.delete(key);
        else next.set(key, String(value));
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const clear = useCallback(() => setFilters(EMPTY_FILTERS), [setFilters]);
  const apply = useCallback((list: Incident[]) => filterIncidents(list, filters), [filters]);

  return { filters, setFilters, clear, apply, isFiltered: hasActiveFilters(filters) };
}
