"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useReplaceParams } from "@/hooks/useReplaceParams";
import {
  EMPTY_FILTERS,
  applyFilterPatch,
  hasActiveFilters,
  parseFilters,
  type IncidentFilters,
} from "@/lib/domain/filters";

// Filter state lives in the URL so views can be shared and the back button works.
// Uses useSearchParams, so the calling page must be wrapped in <Suspense>.
export function useIncidentFilters() {
  const params = useSearchParams();
  const replaceParams = useReplaceParams();
  const filters = useMemo(() => parseFilters(new URLSearchParams(params.toString())), [params]);

  const setFilters = useCallback(
    (patch: Partial<IncidentFilters>) => replaceParams(applyFilterPatch(params, patch)),
    [params, replaceParams],
  );

  const clear = useCallback(() => setFilters(EMPTY_FILTERS), [setFilters]);

  return { filters, setFilters, clear, isFiltered: hasActiveFilters(filters) };
}
