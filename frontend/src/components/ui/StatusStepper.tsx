import Check from "@mui/icons-material/Check";
import { cn } from "@/lib/cn";
import { STATUSES, STATUS_LABEL } from "@/lib/domain/incident";
import type { IncidentStatus } from "@/types/domain";

// The seven lifecycle steps with the current one marked. Scrolls sideways on narrow screens.
export function StatusStepper({ status }: { status: IncidentStatus }) {
  const current = STATUSES.indexOf(status);
  return (
    <ol aria-label="Incident progress" className="flex gap-1 overflow-x-auto pb-1">
      {STATUSES.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li
            key={step}
            aria-current={active ? "step" : undefined}
            className={cn(
              "flex min-w-24 flex-1 flex-col gap-1.5 border-t-2 pt-2 text-xs",
              done || active ? "border-accent" : "border-border",
              active ? "font-semibold text-fg" : "text-muted",
            )}
          >
            <span className="flex items-center gap-1">
              {done ? (
                <Check fontSize="inherit" className="text-accent-text" />
              ) : (
                <span className="font-mono">{index + 1}</span>
              )}
              <span className="sr-only">{done ? "Completed:" : active ? "Current:" : "Upcoming:"}</span>
            </span>
            {STATUS_LABEL[step]}
          </li>
        );
      })}
    </ol>
  );
}
