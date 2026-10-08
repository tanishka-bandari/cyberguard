import type { Incident, IncidentStatus, IncidentType, Severity } from "@/types/domain";

// Ordered most to least urgent.
export const SEVERITIES: readonly Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

export const STATUSES: readonly IncidentStatus[] = [
  "REPORTED",
  "TRIAGED",
  "ASSIGNED",
  "UNDER_INVESTIGATION",
  "CONTAINED",
  "RESOLVED",
  "CLOSED",
];

export const INCIDENT_TYPES: readonly IncidentType[] = [
  "PHISHING",
  "MALWARE",
  "RANSOMWARE",
  "DATA_BREACH",
  "UNAUTHORIZED_ACCESS",
  "DDOS",
  "SOCIAL_ENGINEERING",
  "OTHER",
];

export const SEVERITY_LABEL: Record<Severity, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export const SEVERITY_OPTIONS = SEVERITIES.map((s) => ({ value: s, label: SEVERITY_LABEL[s] }));

export const STATUS_LABEL: Record<IncidentStatus, string> = {
  REPORTED: "Reported",
  TRIAGED: "Triaged",
  ASSIGNED: "Assigned",
  UNDER_INVESTIGATION: "Under investigation",
  CONTAINED: "Contained",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const TYPE_LABEL: Record<IncidentType, string> = {
  PHISHING: "Phishing",
  MALWARE: "Malware",
  RANSOMWARE: "Ransomware",
  DATA_BREACH: "Data breach",
  UNAUTHORIZED_ACCESS: "Unauthorized access",
  DDOS: "DDoS",
  SOCIAL_ENGINEERING: "Social engineering",
  OTHER: "Other",
};

export const TYPE_OPTIONS = INCIDENT_TYPES.map((t) => ({ value: t, label: TYPE_LABEL[t] }));

// The backend has no progress field; it is derived from the status.
export const STATUS_PROGRESS: Record<IncidentStatus, number> = {
  REPORTED: 0,
  TRIAGED: 15,
  ASSIGNED: 25,
  UNDER_INVESTIGATION: 50,
  CONTAINED: 75,
  RESOLVED: 95,
  CLOSED: 100,
};

export type StatusGroup = "reported" | "assigned" | "progress" | "solved";

export const STATUS_GROUP: Record<IncidentStatus, StatusGroup> = {
  REPORTED: "reported",
  TRIAGED: "progress",
  ASSIGNED: "assigned",
  UNDER_INVESTIGATION: "progress",
  CONTAINED: "progress",
  RESOLVED: "solved",
  CLOSED: "solved",
};

export const GROUP_LABEL: Record<StatusGroup, string> = {
  reported: "Reported",
  assigned: "Assigned",
  progress: "In progress",
  solved: "Solved",
};

export const STATUS_GROUPS = Object.keys(GROUP_LABEL) as StatusGroup[];

// Policy constants: hours allowed from report to resolution, by severity.
export const SLA_HOURS: Record<Severity, number> = {
  CRITICAL: 4,
  HIGH: 24,
  MEDIUM: 72,
  LOW: 168,
};

// Limits of the report form, matching the backend validation.
export const TITLE_MAX = 200;
export const DESCRIPTION_MAX = 2000;

// Risk score a new report starts with, before the reporter adjusts it.
export const DEFAULT_RISK_SCORE: Record<Severity, number> = { LOW: 20, MEDIUM: 45, HIGH: 70, CRITICAL: 90 };

export const isOpen = (incident: Pick<Incident, "status">) =>
  STATUS_GROUP[incident.status] !== "solved";

// The backend only accepts these statuses for an incident that has an assignee.
const NEEDS_ASSIGNEE: readonly IncidentStatus[] = ["ASSIGNED", "UNDER_INVESTIGATION", "CONTAINED"];

export const needsAssignee = (status: IncidentStatus) => NEEDS_ASSIGNEE.includes(status);

export const canMoveTo = (incident: Pick<Incident, "assignee">, status: IncidentStatus) =>
  !needsAssignee(status) || incident.assignee !== null;

// Solved incidents must be reopened before they can get an assignee.
export const isAssignable = (incident: Pick<Incident, "status">) => isOpen(incident);

export const replaceIncident = (list: Incident[] | undefined, saved: Incident) =>
  list?.map((i) => (i.id === saved.id ? saved : i));

export const progressOf = (incident: Pick<Incident, "status">) => STATUS_PROGRESS[incident.status];

export const slaDeadline = (incident: Pick<Incident, "severity" | "reportedAt">) =>
  new Date(incident.reportedAt.getTime() + SLA_HOURS[incident.severity] * 3_600_000);

export const isSlaBreached = (incident: Incident, now: Date = new Date()) =>
  isOpen(incident) && now.getTime() > slaDeadline(incident).getTime();

export function riskLevel(score: number): Severity {
  if (score >= 75) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MEDIUM";
  return "LOW";
}

export const severityRank = (severity: Severity) => SEVERITIES.length - SEVERITIES.indexOf(severity);
