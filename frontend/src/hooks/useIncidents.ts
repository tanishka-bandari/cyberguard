"use client";

import useSWR from "swr";
import { useAuthedKey } from "@/hooks/useAuthedKey";
import { listIncidents } from "@/lib/api/incidents";

export const INCIDENTS_KEY = "/incidents";
const INCIDENTS_REFRESH_MS = 20_000;

// USER sees their own incidents, ANALYST/ADMIN see all. Polls so new reports appear.
export function useIncidents() {
  const key = useAuthedKey(INCIDENTS_KEY);
  return useSWR(key, listIncidents, { refreshInterval: INCIDENTS_REFRESH_MS });
}
