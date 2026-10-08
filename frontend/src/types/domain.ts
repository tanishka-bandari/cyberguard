// What the UI works with: timestamps are Date, people are objects.
export type { Role, IncidentType, Severity, IncidentStatus } from "@/types/api";
import type { IncidentStatus, IncidentType, Role, Severity } from "@/types/api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Session {
  token: string;
  user: User;
}

export interface Person {
  id: number;
  name: string;
  email: string;
}

export interface Incident {
  id: number;
  title: string;
  description: string;
  type: IncidentType;
  severity: Severity;
  status: IncidentStatus;
  riskScore: number;
  reporter: Person;
  assignee: Person | null;
  reportedAt: Date;
}

export interface Note {
  id: number;
  text: string;
  incidentId: number;
  author: Person;
  createdAt: Date;
}

export interface Evidence {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  sha256: string;
  incidentId: number;
  uploadedBy: { id: number; name: string };
  uploadedAt: Date;
}

export interface AuditEntry {
  id: number;
  action: string;
  details: string;
  actor: { id: number | null; name: string; email: string };
  incidentId: number | null;
  createdAt: Date;
}

export interface NewIncident {
  title: string;
  description: string;
  type: IncidentType;
  severity: Severity;
  riskScore: number;
}
