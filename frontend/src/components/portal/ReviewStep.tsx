import { TypeIcon } from "@/components/portal/TypeIcon";
import type { ReportDraft } from "@/components/portal/reportDraft";
import { RiskMeter } from "@/components/ui/RiskMeter";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { TYPE_LABEL } from "@/lib/domain/incident";
import { formatFileSize } from "@/lib/format";

export function ReviewStep({ draft }: { draft: ReportDraft }) {
  if (!draft.type || !draft.severity) return null;
  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-2xl text-accent-text">
          <TypeIcon type={draft.type} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="break-words font-semibold">{draft.title.trim()}</p>
          <p className="text-sm text-muted">{TYPE_LABEL[draft.type]}</p>
        </div>
        <SeverityBadge severity={draft.severity} />
      </div>
      <RiskMeter value={draft.riskScore} />
      <p className="whitespace-pre-wrap break-words text-sm">{draft.description.trim()}</p>
      {draft.files.length > 0 && (
        <div>
          <p className="text-sm font-medium">Evidence</p>
          <ul className="mt-1 list-inside list-disc text-sm text-muted">
            {draft.files.map((file, index) => (
              <li key={`${file.name}-${index}`}>
                {file.name} ({formatFileSize(file.size)})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
