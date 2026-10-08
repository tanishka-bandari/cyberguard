import { request } from "@/lib/api/client";
import { toNote } from "@/lib/api/mappers";
import type { NoteDto } from "@/types/api";
import type { Note } from "@/types/domain";

export async function listNotes(incidentId: number): Promise<Note[]> {
  const dtos = await request<NoteDto[]>("GET", `/incidents/${incidentId}/notes`);
  return dtos.map(toNote);
}

export async function addNote(incidentId: number, text: string): Promise<Note> {
  const dto = await request<NoteDto>("POST", `/incidents/${incidentId}/notes`, {
    form: { content: text },
  });
  return toNote(dto);
}
