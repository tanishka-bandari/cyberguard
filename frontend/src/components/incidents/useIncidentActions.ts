"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { auditKey } from "@/hooks/useAuditLog";
import { INCIDENTS_KEY } from "@/hooks/useIncidents";
import { assignIncident, deleteIncident, unassignIncident, updateStatus } from "@/lib/api/incidents";
import { STATUS_LABEL } from "@/lib/domain/incident";
import { toast } from "@/lib/toast";
import type { Incident, IncidentStatus } from "@/types/domain";

// Status, assignment and delete for one incident. Each write patches the shared
// incident list with the server's answer and refreshes the audit trail.
export function useIncidentActions(incident: Incident, listHref: string) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<Incident>, success: string) {
    setBusy(true);
    try {
      const updated = await action();
      await mutate(INCIDENTS_KEY, (list?: Incident[]) => list?.map((i) => (i.id === updated.id ? updated : i)), {
        revalidate: false,
      });
      void mutate(auditKey(incident.id));
      toast.success(success);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The change could not be saved");
    } finally {
      setBusy(false);
    }
  }

  return {
    busy,
    changeStatus: (status: IncidentStatus) =>
      run(() => updateStatus(incident.id, status), `Status changed to ${STATUS_LABEL[status].toLowerCase()}`),
    assign: (userId: number) => run(() => assignIncident(incident.id, userId), "Incident assigned"),
    unassign: () => run(() => unassignIncident(incident.id), "Incident unassigned"),
    async remove() {
      setBusy(true);
      try {
        await deleteIncident(incident.id);
        toast.success(`Incident #${incident.id} deleted`);
        router.push(listHref);
        void mutate(INCIDENTS_KEY);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "The incident could not be deleted");
        setBusy(false);
      }
    },
  };
}
