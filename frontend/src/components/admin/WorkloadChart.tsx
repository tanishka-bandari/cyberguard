"use client";

import { useMemo } from "react";
import { CountBarChart } from "@/components/dashboard/CountBarChart";
import { OVERLOADED_OPEN, type StaffWorkload } from "@/lib/domain/stats";

// Open incidents per staff member, with the overload threshold drawn as a reference line.
export function WorkloadChart({ workload }: { workload: readonly StaffWorkload[] }) {
  const data = useMemo(
    () =>
      [...workload]
        .sort((a, b) => b.open - a.open)
        .map((w) => ({ key: String(w.person.id), label: w.person.name, value: w.open })),
    [workload],
  );
  const overloaded = workload.filter((w) => w.open >= OVERLOADED_OPEN).length;
  return (
    <CountBarChart
      data={data}
      unit="open"
      ariaLabel={`Bar chart of open incidents per staff member. ${overloaded} at or above the overload line of ${OVERLOADED_OPEN}.`}
      reference={{ value: OVERLOADED_OPEN, label: `Overloaded at ${OVERLOADED_OPEN} open` }}
    />
  );
}
