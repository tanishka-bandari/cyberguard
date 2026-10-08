import { cn } from "@/lib/cn";
import { STEP_TITLES } from "@/components/portal/reportDraft";

export function StepIndicator({ current }: { current: number }) {
  return (
    <ol aria-label="Report steps" className="grid grid-cols-4 gap-2">
      {STEP_TITLES.map((title, index) => (
        <li
          key={title}
          aria-current={index === current ? "step" : undefined}
          className={cn(
            "flex flex-col gap-1 border-t-2 pt-2 text-sm",
            index <= current ? "border-accent" : "border-border",
            index === current ? "font-semibold text-fg" : "text-muted",
          )}
        >
          <span className="font-mono text-xs">{index + 1}</span>
          <span className="sr-only sm:not-sr-only">{title}</span>
        </li>
      ))}
    </ol>
  );
}
