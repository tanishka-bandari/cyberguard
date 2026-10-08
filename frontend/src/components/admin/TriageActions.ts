"use client";

import { useIncidentMutations } from "@/hooks/useIncidentMutations";
import { assignIncident, unassignIncident, updateStatus } from "@/lib/api/incidents";
import { STATUS_LABEL } from "@/lib/domain/incident";
import type { Incident, IncidentStatus, Person } from "@/types/domain";

export function useTriageActions() {
  const mutateIncident = useIncidentMutations();

  return {
    move: (incident: Incident, status: IncidentStatus) =>
      mutateIncident(updateStatus(incident.id, status), `#${incident.id} moved to ${STATUS_LABEL[status]}`),

    assign: (incident: Incident, person: Person) =>
      mutateIncident(assignIncident(incident.id, person.id), `#${incident.id} assigned to ${person.name}`),

    unassign: (incident: Incident) =>
      mutateIncident(unassignIncident(incident.id), `#${incident.id} unassigned`),
  };
}
