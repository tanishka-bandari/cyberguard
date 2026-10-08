import { request } from "@/lib/api/client";
import { toIncident } from "@/lib/api/mappers";
import type { IncidentDto } from "@/types/api";
import type { Incident, IncidentStatus, NewIncident } from "@/types/domain";

// Reporters get their own incidents back, staff get all of them.
export async function listIncidents(): Promise<Incident[]> {
  const dtos = await request<IncidentDto[]>("GET", "/incidents");
  return dtos.map(toIncident);
}

export async function createIncident(input: NewIncident): Promise<Incident> {
  const dto = await request<IncidentDto>("POST", "/incidents", { form: { ...input } });
  return toIncident(dto);
}

export async function updateStatus(id: number, status: IncidentStatus): Promise<Incident> {
  const dto = await request<IncidentDto>("PUT", `/incidents/${id}/status`, { form: { status } });
  return toIncident(dto);
}

export async function assignIncident(id: number, userId: number): Promise<Incident> {
  const dto = await request<IncidentDto>("PUT", `/incidents/${id}/assign`, { form: { userId } });
  return toIncident(dto);
}

export async function unassignIncident(id: number): Promise<Incident> {
  const dto = await request<IncidentDto>("PUT", `/incidents/${id}/unassign`);
  return toIncident(dto);
}

export async function deleteIncident(id: number): Promise<void> {
  await request("DELETE", `/incidents/${id}`);
}
