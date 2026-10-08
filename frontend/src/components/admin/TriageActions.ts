"use client";

import { useSWRConfig } from "swr";
import { INCIDENTS_KEY } from "@/hooks/useIncidents";
import { assignIncident, unassignIncident, updateStatus } from "@/lib/api/incidents";
import { STATUS_LABEL, statusAfterAssign, statusAfterUnassign } from "@/lib/domain/incident";
import { toast } from "@/lib/toast";
import type { Incident, IncidentStatus, Person } from "@/types/domain";

// Optimistic edits to the cached incident list. A failed request restores the
// previous list (rollbackOnError) and shows the server's message.
export function useTriageActions() {
  const { mutate } = useSWRConfig();

  async function run(
    incident: Incident,
    optimistic: Incident,
    request: Promise<Incident>,
    success: string,
  ) {
    const replace = (saved: Incident) => (list: Incident[] = []) =>
      list.map((i) => (i.id === saved.id ? saved : i));
    try {
      await mutate<Incident[], Incident>(INCIDENTS_KEY, request, {
        optimisticData: replace(optimistic),
        populateCache: (saved, list) => replace(saved)(list),
        rollbackOnError: true,
        revalidate: false,
      });
      toast.success(success);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Could not update #${incident.id}`);
    }
  }

  return {
    move: (incident: Incident, status: IncidentStatus) =>
      run(
        incident,
        { ...incident, status },
        updateStatus(incident.id, status),
        `#${incident.id} moved to ${STATUS_LABEL[status]}`,
      ),

    assign: (incident: Incident, person: Person) =>
      run(
        incident,
        { ...incident, assignee: person, status: statusAfterAssign(incident.status) },
        assignIncident(incident.id, person.id),
        `#${incident.id} assigned to ${person.name}`,
      ),

    unassign: (incident: Incident) =>
      run(
        incident,
        { ...incident, assignee: null, status: statusAfterUnassign(incident.status) },
        unassignIncident(incident.id),
        `#${incident.id} unassigned`,
      ),
  };
}
