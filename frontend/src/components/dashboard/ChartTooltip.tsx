import type { TooltipContentProps } from "recharts";

// Value first and bold, series name secondary, a short line key for the colour.
export function ChartTooltip({ active, payload, label, unit }: TooltipContentProps & { unit?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-panel px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-fg">{label}</p>
      <ul className="space-y-0.5">
        {payload.map((row) => (
          <li key={String(row.dataKey)} className="flex items-center gap-2">
            <span aria-hidden="true" className="h-0.5 w-3" style={{ background: row.color ?? row.fill }} />
            <span className="font-semibold tabular-nums text-fg">
              {String(row.value)}
              {unit ? ` ${unit}` : ""}
            </span>
            {payload.length > 1 && <span className="text-muted">{row.name}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
