import Check from "@mui/icons-material/Check";
import { cn } from "@/lib/cn";
import { STATUSES, STATUS_LABEL } from "@/lib/domain/incident";
import type { IncidentStatus } from "@/types/domain";

interface StatusStepperProps {
  status: IncidentStatus;
  // With onSelect every step except the current one becomes a button; `disabled` can switch some off.
  onSelect?: (status: IncidentStatus) => void;
  disabled?: (step: IncidentStatus) => boolean;
}

// The seven lifecycle steps with the current one marked. Scrolls sideways on narrow screens.
export function StatusStepper({ status, onSelect, disabled }: StatusStepperProps) {
  const current = STATUSES.indexOf(status);
  return (
    <ol aria-label={onSelect ? "Set incident status" : "Incident progress"} className="flex gap-1 overflow-x-auto pb-1">
      {STATUSES.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const content = (
          <>
            <span className="flex items-center gap-1">
              {done ? (
                <Check fontSize="inherit" className="text-accent-text" />
              ) : (
                <span className="font-mono">{index + 1}</span>
              )}
              <span className="sr-only">{done ? "Completed:" : active ? "Current:" : onSelect ? "Set to:" : "Upcoming:"}</span>
            </span>
            {STATUS_LABEL[step]}
          </>
        );
        return (
          <li
            key={step}
            aria-current={active ? "step" : undefined}
            className={cn(
              "min-w-24 flex-1 border-t-2 text-xs",
              done || active ? "border-accent" : "border-border",
              active ? "font-semibold text-fg" : "text-muted",
            )}
          >
            {onSelect ? (
              <button
                type="button"
                disabled={active || disabled?.(step)}
                onClick={() => onSelect(step)}
                className="flex w-full flex-col gap-1.5 rounded-b-md px-1 pb-1 pt-2 text-left enabled:hover:bg-hover disabled:cursor-default disabled:opacity-60"
              >
                {content}
              </button>
            ) : (
              <div className="flex flex-col gap-1.5 pt-2">{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
