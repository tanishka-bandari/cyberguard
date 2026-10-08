import { FilePicker } from "@/components/portal/FilePicker";
import { DESCRIPTION_MAX, TITLE_MAX } from "@/components/portal/reportOptions";
import type { DraftErrors, ReportDraft } from "@/components/portal/reportDraft";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface DetailsStepProps {
  draft: ReportDraft;
  errors: DraftErrors;
  fileError: string;
  onChange: (patch: Partial<ReportDraft>) => void;
  onPickFiles: (picked: File[]) => void;
}

export function DetailsStep({ draft, errors, fileError, onChange, onPickFiles }: DetailsStepProps) {
  return (
    <div className="max-w-2xl space-y-4">
      <Input
        label="Short title"
        value={draft.title}
        maxLength={TITLE_MAX}
        placeholder="For example: Fake Microsoft sign-in email"
        error={errors.title}
        onChange={(event) => onChange({ title: event.target.value })}
        required
      />
      <Textarea
        label="What did you see?"
        hint="When did it happen, on which device, and what did you click or notice?"
        rows={6}
        value={draft.description}
        maxLength={DESCRIPTION_MAX}
        error={errors.description}
        onChange={(event) => onChange({ description: event.target.value })}
        required
      />
      <FilePicker
        files={draft.files}
        error={fileError}
        onPick={onPickFiles}
        onRemove={(index) => onChange({ files: draft.files.filter((_, i) => i !== index) })}
      />
    </div>
  );
}
