"use client";

import useSWR from "swr";
import { useAuthedKey } from "@/hooks/useAuthedKey";
import { listIncidentAudit } from "@/lib/api/audit";

export const auditKey = (incidentId: number) => `/audit-logs/incident/${incidentId}`;

export function useAuditLog(incidentId: number) {
  const key = useAuthedKey(auditKey(incidentId));
  return useSWR(key, () => listIncidentAudit(incidentId));
}
