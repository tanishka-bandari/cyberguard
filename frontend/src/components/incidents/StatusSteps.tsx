import Check from "@mui/icons-material/Check";
import { cn } from "@/lib/cn";
import { STATUSES, STATUS_LABEL } from "@/lib/domain/incident";
import type { IncidentStatus } from "@/types/domain";

interface StatusStepsProps {
  status: IncidentStatus;
  onSelect: (status: IncidentStatus) => void;
  disabled?: boolean;
}

// Clickable version of the read-only StatusStepper, for staff.
export function StatusSteps({ status, onSelect, disabled }: StatusStepsProps) {
  const current = STATUSES.indexOf(status);
  return (
    <ol aria-label="Set incident status" className="flex gap-1 overflow-x-auto pb-1">
      {STATUSES.map((step, index) => {
        const active = index === current;
        return (
          <li key={step} className="min-w-24 flex-1">
            <button
              type="button"
              aria-current={active ? "step" : undefined}
              disabled={disabled || active}
              onClick={() => onSelect(step)}
              className={cn(
                "flex w-full flex-col items-start gap-1.5 rounded-b-md border-t-2 px-1 pb-1 pt-2 text-left text-xs",
                "enabled:hover:bg-hover disabled:cursor-default",
                index <= current ? "border-accent" : "border-border",
                active ? "font-semibold text-fg" : "text-muted",
              )}
            >
              <span className="flex items-center gap-1">
                {index < current ? <Check fontSize="inherit" className="text-accent-text" /> : <span className="font-mono">{index + 1}</span>}
                <span className="sr-only">{index < current ? "Completed:" : active ? "Current:" : "Set to:"}</span>
              </span>
              {STATUS_LABEL[step]}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
