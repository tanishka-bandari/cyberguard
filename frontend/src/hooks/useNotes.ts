"use client";

import useSWR from "swr";
import { useAuthedKey } from "@/hooks/useAuthedKey";
import { listNotes } from "@/lib/api/notes";

export const notesKey = (incidentId: number) => `/incidents/${incidentId}/notes`;

export function useNotes(incidentId: number) {
  const key = useAuthedKey(notesKey(incidentId));
  return useSWR(key, () => listNotes(incidentId));
}
