"use client";

import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartLegend } from "@/components/dashboard/ChartLegend";
import { ChartTooltip } from "@/components/dashboard/ChartTooltip";
import type { DayBucket } from "@/lib/domain/stats";

const dayLabel = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const tick = { fill: "var(--muted)", fontSize: 12 };
const TOTAL = "var(--series-1)";
const CRITICAL = "var(--critical)";

// Total and critical incidents per day on one count axis.
export function TrendChart({ buckets }: { buckets: readonly DayBucket[] }) {
  const data = useMemo(
    () => buckets.map((b) => ({ label: dayLabel.format(b.day), total: b.total, critical: b.bySeverity.CRITICAL })),
    [buckets],
  );
  const dot = (stroke: string) => ({ r: 4, fill: stroke, stroke: "var(--panel)", strokeWidth: 2 });
  return (
    <>
      <ChartLegend items={[{ label: "All incidents", color: TOTAL }, { label: "Critical", color: CRITICAL }]} />
      <div role="img" aria-label={`Line chart of incidents reported per day over the last ${buckets.length} days.`} className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} minTickGap={24} />
            <YAxis allowDecimals={false} tick={tick} axisLine={false} tickLine={false} />
            <Tooltip content={(props) => <ChartTooltip {...props} />} cursor={{ stroke: "var(--border)" }} />
            <Line dataKey="total" name="All incidents" stroke={TOTAL} strokeWidth={2} dot={dot(TOTAL)} activeDot={dot(TOTAL)} />
            <Line dataKey="critical" name="Critical" stroke={CRITICAL} strokeWidth={2} dot={dot(CRITICAL)} activeDot={dot(CRITICAL)} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
