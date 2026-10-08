import { MAX_FILES, MAX_FILE_BYTES } from "@/components/portal/reportOptions";
import { formatFileSize } from "@/lib/format";
import type { IncidentType, Severity } from "@/types/domain";

export interface ReportDraft {
  type: IncidentType | null;
  severity: Severity | null;
  riskScore: number;
  title: string;
  description: string;
  files: File[];
}

export const EMPTY_DRAFT: ReportDraft = {
  type: null,
  severity: null,
  riskScore: 0,
  title: "",
  description: "",
  files: [],
};

export type DraftErrors = Partial<Record<"type" | "severity" | "title" | "description", string>>;

export const STEP_TITLES = ["What happened?", "How serious is it?", "Tell us more", "Review and send"] as const;

export function validateStep(step: number, draft: ReportDraft): DraftErrors {
  if (step === 0 && !draft.type) return { type: "Choose what kind of incident this is." };
  if (step === 1 && !draft.severity) return { severity: "Choose how serious it seems." };
  if (step === 2) {
    const errors: DraftErrors = {};
    const title = draft.title.trim();
    const description = draft.description.trim();
    if (!title) errors.title = "Give the report a short title.";
    if (!description) errors.description = "Describe what you saw.";
    return errors;
  }
  return {};
}

// Keeps the files that fit the limits and explains why the others were left out.
export function addFiles(current: File[], picked: File[]): { files: File[]; error: string } {
  const files = [...current];
  const problems: string[] = [];
  for (const file of picked) {
    if (file.size > MAX_FILE_BYTES) problems.push(`${file.name} is larger than ${formatFileSize(MAX_FILE_BYTES)}.`);
    else if (file.size === 0) problems.push(`${file.name} is empty.`);
    else if (files.length >= MAX_FILES) problems.push(`${file.name} was not added; the limit is ${MAX_FILES} files.`);
    else files.push(file);
  }
  return { files, error: problems.join(" ") };
}
