"use client";

import useSWR from "swr";
import { describeUpdate } from "@/components/portal/caseUpdates";
import { useAuthedKey } from "@/hooks/useAuthedKey";
import { INCIDENTS_REFRESH_MS } from "@/hooks/useIncidents";
import { listIncidentAudit } from "@/lib/api/audit";

export interface CaseUpdate {
  id: number;
  incidentId: number;
  text: string;
  createdAt: Date;
}

const MAX_UPDATES = 6;

async function fetchUpdates(incidentIds: number[]): Promise<CaseUpdate[]> {
  const logs = await Promise.all(incidentIds.map((id) => listIncidentAudit(id)));
  return logs
    .flat()
    .flatMap((entry) => {
      const text = describeUpdate(entry);
      return text && entry.incidentId !== null
        ? [{ id: entry.id, incidentId: entry.incidentId, text, createdAt: entry.createdAt }]
        : [];
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, MAX_UPDATES);
}

// One request per case, merged into a single newest-first feed.
export function useCaseUpdates(incidentIds: number[]) {
  const key = useAuthedKey(incidentIds.length ? `/portal/updates/${incidentIds.join(",")}` : null);
  return useSWR(key, () => fetchUpdates(incidentIds), { refreshInterval: INCIDENTS_REFRESH_MS });
}
