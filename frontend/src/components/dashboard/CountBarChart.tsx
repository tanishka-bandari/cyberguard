"use client";

import { Bar, BarChart, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "@/components/dashboard/ChartTooltip";

export interface CountDatum {
  key: string;
  label: string;
  value: number;
}

interface CountBarChartProps {
  data: readonly CountDatum[];
  ariaLabel: string;
  unit: string; // "incidents", shown in the tooltip
  selectedKey?: string | null;
  onSelect?: (key: string) => void;
  reference?: { value: number; label: string };
}

const ROW_HEIGHT = 36;
const tick = { fill: "var(--muted)", fontSize: 12 };

// Horizontal bars for one measure. Not keyboard-focusable on purpose: the filters and the
// table beside each chart hold the same data and the same actions.
export function CountBarChart({ data, ariaLabel, unit, selectedKey, onSelect, reference }: CountBarChartProps) {
  const max = Math.max(reference?.value ?? 0, ...data.map((d) => d.value));
  return (
    <div role="img" aria-label={ariaLabel} style={{ height: data.length * ROW_HEIGHT + 32 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 16, right: 32, bottom: 0, left: 0 }}>
          <XAxis type="number" allowDecimals={false} domain={[0, max + 1]} tick={tick} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="label" width={130} tick={tick} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "var(--hover)" }}
            content={(props) => <ChartTooltip {...props} unit={unit} />}
          />
          {reference && (
            <ReferenceLine
              x={reference.value}
              stroke="var(--critical)"
              strokeDasharray="4 3"
              label={{ value: reference.label, position: "top", fill: "var(--muted)", fontSize: 11 }}
            />
          )}
          <Bar
            dataKey="value"
            name={unit}
            maxBarSize={20}
            radius={[0, 4, 4, 0]}
            cursor={onSelect ? "pointer" : undefined}
            onClick={(_, index) => onSelect?.(data[index].key)}
          >
            {data.map((d) => (
              <Cell
                key={d.key}
                fill="var(--series-1)"
                fillOpacity={selectedKey && selectedKey !== d.key ? 0.4 : 1}
              />
            ))}
            <LabelList dataKey="value" position="right" fill="var(--fg)" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
