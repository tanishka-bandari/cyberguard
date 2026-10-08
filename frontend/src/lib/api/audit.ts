import { request } from "@/lib/api/client";
import { toAuditEntry } from "@/lib/api/mappers";
import type { AuditLogDto } from "@/types/api";
import type { AuditEntry } from "@/types/domain";

export async function listIncidentAudit(incidentId: number): Promise<AuditEntry[]> {
  const dtos = await request<AuditLogDto[]>("GET", `/audit-logs/incident/${incidentId}`);
  return dtos.map(toAuditEntry);
}

export async function listRecentAudit(limit = 50): Promise<AuditEntry[]> {
  const dtos = await request<AuditLogDto[]>("GET", "/audit-logs/recent", { params: { limit } });
  return dtos.map(toAuditEntry);
}
