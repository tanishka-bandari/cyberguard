import { request, requestBlob } from "@/lib/api/client";
import { toEvidence } from "@/lib/api/mappers";
import type { EvidenceDto } from "@/types/api";
import type { Evidence } from "@/types/domain";

export async function listEvidence(incidentId: number): Promise<Evidence[]> {
  const dtos = await request<EvidenceDto[]>("GET", `/incidents/${incidentId}/evidence`);
  return dtos.map(toEvidence);
}

export async function uploadEvidence(incidentId: number, file: File): Promise<Evidence> {
  const body = new FormData();
  body.append("file", file);
  const dto = await request<EvidenceDto>("POST", `/incidents/${incidentId}/evidence`, {
    multipart: body,
  });
  return toEvidence(dto);
}

// The file endpoint needs the Bearer header, so a plain link would not work:
// fetch the bytes, then hand the browser a temporary object URL to save.
export async function downloadEvidence(item: Evidence): Promise<void> {
  const blob = await requestBlob(`/incidents/${item.incidentId}/evidence/${item.id}/file`);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = item.fileName;
  document.body.append(link);
  link.click();
  link.remove();
  // Some browsers start the save asynchronously, so keep the URL alive for a moment.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
