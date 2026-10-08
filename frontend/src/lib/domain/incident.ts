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

export const isOpen = (incident: Pick<Incident, "status">) =>
  STATUS_GROUP[incident.status] !== "solved";

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
