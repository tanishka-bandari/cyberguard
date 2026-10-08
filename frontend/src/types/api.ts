// Wire types. Field names mirror the Java DTOs in backend/.../dto exactly.
// Timestamps are UTC LocalDateTime without an offset ("2026-10-08T14:03:00"),
// or an array [y, m, d, h, mi, s] in old rows.

export type Role = "USER" | "ANALYST" | "ADMIN";

export type IncidentType =
  | "PHISHING"
  | "MALWARE"
  | "RANSOMWARE"
  | "DATA_BREACH"
  | "UNAUTHORIZED_ACCESS"
  | "DDOS"
  | "SOCIAL_ENGINEERING"
  | "OTHER";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IncidentStatus =
  | "REPORTED"
  | "TRIAGED"
  | "ASSIGNED"
  | "UNDER_INVESTIGATION"
  | "CONTAINED"
  | "RESOLVED"
  | "CLOSED";

export type ApiTimestamp = string | number[];

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface UserDto {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface IncidentDto {
  id: number;
  title: string;
  description: string;
  type: IncidentType;
  severity: Severity;
  status: IncidentStatus;
  riskScore: number;
  reportedById: number;
  reportedByName: string;
  reportedByEmail: string;
  assignedToId: number | null;
  assignedToName: string | null;
  assignedToEmail: string | null;
  reportedAt: ApiTimestamp;
}

export interface NoteDto {
  id: number;
  note: string;
  incidentId: number;
  addedById: number;
  addedByName: string;
  addedByEmail: string;
  createdAt: ApiTimestamp;
}

export interface EvidenceDto {
  id: number;
  fileName: string;
  fileType: string | null;
  fileSize: number;
  sha256Hash: string;
  incidentId: number;
  uploadedById: number;
  uploadedByName: string;
  uploadedAt: ApiTimestamp;
}

export interface AuditLogDto {
  id: number;
  action: string;
  details: string;
  userId: number | null;
  userName: string | null;
  userEmail: string | null;
  incidentId: number | null;
  createdAt: ApiTimestamp;
}

export interface ApiErrorBody {
  status: number;
  message: string;
}
