"use client";

import useSWR from "swr";
import { useAuthedKey } from "@/hooks/useAuthedKey";
import { listRecentAudit } from "@/lib/api/audit";

// Staff only: the latest audit entries across all incidents.
export function useRecentActivity(limit = 50) {
  const key = useAuthedKey(`/audit-logs/recent?limit=${limit}`, ["ANALYST", "ADMIN"]);
  return useSWR(key, () => listRecentAudit(limit), { refreshInterval: 30_000 });
}
