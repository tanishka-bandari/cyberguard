import { STATUS_LABEL } from "@/lib/domain/incident";
import type { AuditEntry, IncidentStatus } from "@/types/domain";

// Only status and assignment changes are shown to reporters; notes and uploads stay out of this feed.
export function describeUpdate(entry: AuditEntry): string | null {
  switch (entry.action) {
    case "STATUS_CHANGED": {
      const status = entry.details.split(" to ").pop() as IncidentStatus;
      return STATUS_LABEL[status] ? `Status changed to ${STATUS_LABEL[status]}` : "Status changed";
    }
    case "INCIDENT_ASSIGNED":
      return entry.details;
    case "INCIDENT_UNASSIGNED":
      return "Moved back to the waiting queue";
    default:
      return null;
  }
}
