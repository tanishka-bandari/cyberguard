import type {
  ApiTimestamp,
  AuditLogDto,
  EvidenceDto,
  IncidentDto,
  LoginResponseDto,
  NoteDto,
  UserDto,
} from "@/types/api";
import type { AuditEntry, Evidence, Incident, Note, Session, User } from "@/types/domain";

// The backend sends LocalDateTime in UTC with no offset, so "Z" is added before parsing.
export function parseTimestamp(value: ApiTimestamp): Date {
  if (Array.isArray(value)) {
    const [y, mo, d, h = 0, mi = 0, s = 0] = value;
    return new Date(Date.UTC(y, mo - 1, d, h, mi, s));
  }
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(value);
  return new Date(hasZone ? value : `${value}Z`);
}

export function toUser(dto: UserDto): User {
  return { id: dto.id, name: dto.name, email: dto.email, role: dto.role };
}

export function toSession(dto: LoginResponseDto): Session {
  return { token: dto.token, user: toUser(dto) };
}

export function toIncident(dto: IncidentDto): Incident {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description ?? "",
    type: dto.type,
    severity: dto.severity,
    status: dto.status,
    riskScore: dto.riskScore ?? 0,
    reporter: { id: dto.reportedById, name: dto.reportedByName, email: dto.reportedByEmail },
    assignee:
      dto.assignedToId == null
        ? null
        : {
            id: dto.assignedToId,
            name: dto.assignedToName ?? "Unknown",
            email: dto.assignedToEmail ?? "",
          },
    reportedAt: parseTimestamp(dto.reportedAt),
  };
}

export function toNote(dto: NoteDto): Note {
  return {
    id: dto.id,
    text: dto.note,
    incidentId: dto.incidentId,
    author: { id: dto.addedById, name: dto.addedByName, email: dto.addedByEmail },
    createdAt: parseTimestamp(dto.createdAt),
  };
}

export function toEvidence(dto: EvidenceDto): Evidence {
  return {
    id: dto.id,
    fileName: dto.fileName,
    fileType: dto.fileType ?? "application/octet-stream",
    fileSize: dto.fileSize,
    sha256: dto.sha256Hash,
    incidentId: dto.incidentId,
    uploadedBy: { id: dto.uploadedById, name: dto.uploadedByName },
    uploadedAt: parseTimestamp(dto.uploadedAt),
  };
}

export function toAuditEntry(dto: AuditLogDto): AuditEntry {
  return {
    id: dto.id,
    action: dto.action,
    details: dto.details,
    actor: {
      id: dto.userId,
      name: dto.userName ?? dto.userEmail ?? "System",
      email: dto.userEmail ?? "",
    },
    incidentId: dto.incidentId,
    createdAt: parseTimestamp(dto.createdAt),
  };
}
