// Action names are the constants the backend writes to the audit log.
const ACTION_LABEL: Record<string, string> = {
  INCIDENT_CREATED: "Incident reported",
  STATUS_CHANGED: "Status changed",
  INCIDENT_ASSIGNED: "Assigned",
  INCIDENT_UNASSIGNED: "Unassigned",
  NOTE_ADDED: "Note added",
  EVIDENCE_UPLOADED: "Evidence uploaded",
  INCIDENT_DELETED: "Incident deleted",
};

export const actionLabel = (action: string) =>
  ACTION_LABEL[action] ?? action.charAt(0) + action.slice(1).toLowerCase().replaceAll("_", " ");
