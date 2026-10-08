"use client";

import { useCallback } from "react";
import { useSWRConfig } from "swr";
import { auditKey } from "@/hooks/useAuditLog";
import { INCIDENTS_KEY } from "@/hooks/useIncidents";
import { errorMessage } from "@/lib/api/client";
import { replaceIncident } from "@/lib/domain/incident";
import { toast } from "@/lib/toast";
import type { Incident } from "@/types/domain";

// The one path for changing an incident: the server's answer replaces the cached
// incident, its audit trail is refreshed, and the outcome is toasted.
// Resolves to whether the change was saved.
export function useIncidentMutations() {
  const { mutate } = useSWRConfig();

  return useCallback(
    async (request: Promise<Incident>, successMessage: string) => {
      try {
        const saved = await request;
        await mutate(INCIDENTS_KEY, (list?: Incident[]) => replaceIncident(list, saved), { revalidate: false });
        void mutate(auditKey(saved.id));
        toast.success(successMessage);
        return true;
      } catch (error) {
        toast.error(errorMessage(error, "The change could not be saved"));
        return false;
      }
    },
    [mutate],
  );
}
