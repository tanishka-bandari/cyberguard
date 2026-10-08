"use client";

import useSWR from "swr";
import { useAuthedKey } from "@/hooks/useAuthedKey";
import { listEvidence } from "@/lib/api/evidence";

export const evidenceKey = (incidentId: number) => `/incidents/${incidentId}/evidence`;

export function useEvidence(incidentId: number) {
  const key = useAuthedKey(evidenceKey(incidentId));
  return useSWR(key, () => listEvidence(incidentId));
}
