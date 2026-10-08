"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartLegend } from "@/components/dashboard/ChartLegend";
import { ChartTooltip } from "@/components/dashboard/ChartTooltip";
import { SEVERITIES, SEVERITY_LABEL } from "@/lib/domain/incident";
import type { DayBucket } from "@/lib/domain/stats";
import type { Severity } from "@/types/domain";

interface IncidentsPerDayChartProps {
  buckets: readonly DayBucket[];
  selected: Severity | null;
  onSelect: (severity: Severity) => void;
}

const dayLabel = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const color = (s: Severity) => `var(--${s.toLowerCase()})`;
const tick = { fill: "var(--muted)", fontSize: 12 };
// Lowest severity at the bottom of each stack, critical on top.
const STACK_ORDER = [...SEVERITIES].reverse();

export function IncidentsPerDayChart({ buckets, selected, onSelect }: IncidentsPerDayChartProps) {
  const data = useMemo(() => buckets.map((b) => ({ label: dayLabel.format(b.day), ...b.bySeverity })), [buckets]);
  const total = buckets.reduce((sum, b) => sum + b.total, 0);
  // With many thin bars the 2px gap would swallow the fill.
  const gap = buckets.length > 31 ? 0 : 2;
  return (
    <>
      <ChartLegend items={SEVERITIES.map((s) => ({ label: SEVERITY_LABEL[s], color: color(s) }))} />
      <div
        role="img"
        aria-label={`Stacked bar chart: ${total} incidents reported over ${buckets.length} days, split by severity.`}
        className="h-64"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} minTickGap={24} />
            <YAxis allowDecimals={false} tick={tick} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "var(--hover)" }}
              content={(props) => <ChartTooltip {...props} />}
              itemSorter={(row) => SEVERITIES.indexOf(row.dataKey as Severity)}
            />
            {STACK_ORDER.map((s) => (
              <Bar
                key={s}
                dataKey={s}
                name={SEVERITY_LABEL[s]}
                stackId="severity"
                fill={color(s)}
                fillOpacity={selected && selected !== s ? 0.35 : 1}
                stroke="var(--panel)"
                strokeWidth={gap}
                maxBarSize={24}
                cursor="pointer"
                onClick={() => onSelect(s)}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
