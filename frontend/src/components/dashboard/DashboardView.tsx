"use client";

import { useMemo } from "react";
import { CountBarChart } from "@/components/dashboard/CountBarChart";
import { DashboardKpis } from "@/components/dashboard/DashboardKpis";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { IncidentsPerDayChart } from "@/components/dashboard/IncidentsPerDayChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { useDashboardFilters } from "@/components/dashboard/useDashboardFilters";
import { useNow } from "@/components/dashboard/useNow";
import { IncidentTable } from "@/components/incidents/IncidentTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useIncidents } from "@/hooks/useIncidents";
import { useSession } from "@/hooks/useSession";
import { STATUS_LABEL, TYPE_LABEL } from "@/lib/domain/incident";
import { bucketByDay, byType, openByStatus, reportedWithin } from "@/lib/domain/stats";
import type { IncidentStatus, IncidentType } from "@/types/domain";

const ALL_TIME_CHART_DAYS = 90;

const hrefFor = (incident: { id: number }) => `/incidents/${incident.id}`;

export function DashboardView() {
  const { user } = useSession();
  const { data, error, isLoading, mutate } = useIncidents();
  const now = useNow();
  const view = useDashboardFilters();
  const { filters, range, update, matches, isFiltered, clear } = view;

  const chartDays = range.days ?? ALL_TIME_CHART_DAYS;
  const inRange = useMemo(() => reportedWithin(data ?? [], range.days, now), [data, range.days, now]);
  const filtered = useMemo(() => matches(inRange), [matches, inRange]);
  const buckets = useMemo(() => bucketByDay(filtered, chartDays, now), [filtered, chartDays, now]);
  const statusData = useMemo(
    () => openByStatus(filtered).map((s) => ({ key: s.status, label: STATUS_LABEL[s.status], value: s.count })),
    [filtered],
  );
  const typeData = useMemo(
    () => byType(filtered).map((t) => ({ key: t.type, label: TYPE_LABEL[t.type], value: t.count })),
    [filtered],
  );

  const selectStatus = (status: string) =>
    update({ status: filters.status === status ? null : (status as IncidentStatus), group: null, open: false });

  let body;
  if (error) body = <Card><ErrorState error={error} onRetry={() => void mutate()} /></Card>;
  else if (isLoading || !user) body = <DashboardSkeleton />;
  else {
    const noMatches = (
      <EmptyState
        title="No incidents in this range"
        description={isFiltered ? "No incident matches the current filters." : "Nothing has been reported in this period."}
        action={isFiltered ? <Button size="sm" onClick={clear}>Clear filters</Button> : undefined}
      />
    );
    body = (
      <>
        <DashboardKpis incidents={inRange} rangeLabel={range.label} user={user} hrefFor={view.hrefFor} />
        {filtered.length === 0 ? (
          <Card>{noMatches}</Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card
              title={`Reported per day, last ${chartDays} days`}
              action={range.days === null ? <span className="text-xs text-muted">The rest of the page covers all time</span> : undefined}
              className="lg:col-span-2"
            >
              <IncidentsPerDayChart
                buckets={buckets}
                selected={filters.severity}
                onSelect={(severity) => update({ severity: filters.severity === severity ? null : severity })}
              />
            </Card>
            <Card title="Open incidents by status">
              {statusData.every((s) => s.value === 0) ? (
                <EmptyState title="No open incidents" description="Everything in this selection is solved." />
              ) : (
                <CountBarChart
                  data={statusData}
                  unit="incidents"
                  ariaLabel={`Bar chart of open incidents by status: ${statusData.map((s) => `${s.label} ${s.value}`).join(", ")}.`}
                  selectedKey={filters.status}
                  onSelect={selectStatus}
                />
              )}
            </Card>
            <Card title="Incidents by type">
              <CountBarChart
                data={typeData}
                unit="incidents"
                ariaLabel={`Bar chart of incidents by type: ${typeData.map((t) => `${t.label} ${t.value}`).join(", ")}.`}
                selectedKey={filters.type}
                onSelect={(type) => update({ type: filters.type === type ? null : (type as IncidentType) })}
              />
            </Card>
          </div>
        )}
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card title="Incidents" action={<span className="text-xs text-muted">{filtered.length} matching</span>} flush className="xl:col-span-2">
            <IncidentTable incidents={filtered} hrefFor={hrefFor} empty={noMatches} />
          </Card>
          <Card title="Recent activity" flush>
            <RecentActivity />
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Dashboard" description="Incident volume, workload and the latest activity." />
      <FilterBar view={view} userId={user?.id ?? 0} />
      {body}
    </>
  );
}
