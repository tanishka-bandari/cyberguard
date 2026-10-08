"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { INCIDENTS_KEY } from "@/hooks/useIncidents";
import { useIncidentMutations } from "@/hooks/useIncidentMutations";
import { errorMessage } from "@/lib/api/client";
import { assignIncident, deleteIncident, unassignIncident, updateStatus } from "@/lib/api/incidents";
import { STATUS_LABEL } from "@/lib/domain/incident";
import { toast } from "@/lib/toast";
import type { Incident, IncidentStatus } from "@/types/domain";

// Status, assignment and delete for one incident, with a shared busy flag.
export function useIncidentActions(incident: Incident, listHref: string) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const mutateIncident = useIncidentMutations();
  const [busy, setBusy] = useState(false);

  async function run(request: Promise<Incident>, success: string) {
    setBusy(true);
    await mutateIncident(request, success);
    setBusy(false);
  }

  return {
    busy,
    changeStatus: (status: IncidentStatus) =>
      run(updateStatus(incident.id, status), `Status changed to ${STATUS_LABEL[status].toLowerCase()}`),
    assign: (userId: number) => run(assignIncident(incident.id, userId), "Incident assigned"),
    unassign: () => run(unassignIncident(incident.id), "Incident unassigned"),
    async remove() {
      setBusy(true);
      try {
        await deleteIncident(incident.id);
        toast.success(`Incident #${incident.id} deleted`);
        router.push(listHref);
        void mutate(INCIDENTS_KEY);
      } catch (error) {
        toast.error(errorMessage(error, "The incident could not be deleted"));
        setBusy(false);
      }
    },
  };
}
