"use client";

import { useMemo, useState } from "react";
import { StaffCard } from "@/components/dashboard/StaffCard";
import { StaffDialog } from "@/components/dashboard/StaffDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useIncidents } from "@/hooks/useIncidents";
import { useStaff } from "@/hooks/useStaff";
import { workloadByStaff } from "@/lib/domain/stats";

export function TeamView() {
  const incidents = useIncidents();
  const staff = useStaff();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const workload = useMemo(() => workloadByStaff(incidents.data ?? [], staff.data ?? []), [incidents.data, staff.data]);
  const error = incidents.error ?? staff.error;
  const selected = staff.data?.find((p) => p.id === selectedId) ?? null;

  let body;
  if (error) {
    body = (
      <Card>
        <ErrorState error={error} onRetry={() => void Promise.all([incidents.mutate(), staff.mutate()])} />
      </Card>
    );
  } else if (!incidents.data || !staff.data) {
    body = (
      <div role="status" aria-label="Loading team" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((n) => (
          <Skeleton key={n} className="h-40" />
        ))}
      </div>
    );
  } else if (workload.length === 0) {
    body = (
      <Card>
        <EmptyState title="No staff accounts" description="Analysts and admins appear here once they exist." />
      </Card>
    );
  } else {
    body = (
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {workload.map((w) => (
          <li key={w.person.id}>
            <StaffCard workload={w} onOpen={() => setSelectedId(w.person.id)} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <PageHeader title="Team" description="Who is working on what. Select a person to see their incidents." />
      {body}
      <StaffDialog person={selected} incidents={incidents.data ?? []} onClose={() => setSelectedId(null)} />
    </>
  );
}
