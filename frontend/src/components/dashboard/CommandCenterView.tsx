"use client";

import { useMemo } from "react";
import GroupIcon from "@mui/icons-material/Group";
import FolderOpen from "@mui/icons-material/FolderOpen";
import PersonOff from "@mui/icons-material/PersonOff";
import Schedule from "@mui/icons-material/Schedule";
import { SlaWatchlist } from "@/components/admin/SlaWatchlist";
import { TeamPerformance } from "@/components/admin/TeamPerformance";
import { WorkloadChart } from "@/components/admin/WorkloadChart";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { useNow } from "@/components/dashboard/useNow";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { KpiCard } from "@/components/ui/KpiCard";
import { useIncidents } from "@/hooks/useIncidents";
import { useStaff } from "@/hooks/useStaff";
import { SEVERITIES, SEVERITY_LABEL, SLA_HOURS } from "@/lib/domain/incident";
import { bucketByDay, openIncidents, slaBreaches, unassignedOpen, workloadByStaff } from "@/lib/domain/stats";

const slaPolicy = SEVERITIES.map((s) => `${SEVERITY_LABEL[s]} ${SLA_HOURS[s]}h`).join(", ");

export function CommandCenterView() {
  const incidents = useIncidents();
  const staff = useStaff();
  const now = useNow();

  const data = incidents.data;
  const workload = useMemo(() => workloadByStaff(data ?? [], staff.data ?? []), [data, staff.data]);
  const trend = useMemo(() => bucketByDay(data ?? [], 14, now), [data, now]);

  const error = incidents.error ?? staff.error;
  const retry = () => void Promise.all([incidents.mutate(), staff.mutate()]);

  let body;
  if (error) body = <Card><ErrorState error={error} onRetry={retry} /></Card>;
  else if (!data || !staff.data) body = <DashboardSkeleton />;
  else {
    body = (
      <>
        <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <KpiCard
            label="SLA breaches"
            value={slaBreaches(data, now).length}
            hint={`Policy: ${slaPolicy}`}
            icon={<Schedule fontSize="inherit" />}
            href="#sla-watchlist"
          />
          <KpiCard
            label="Unassigned open"
            value={unassignedOpen(data).length}
            hint="Waiting for an owner"
            icon={<PersonOff fontSize="inherit" />}
            href="/admin/triage"
          />
          <KpiCard label="Open total" value={openIncidents(data).length} icon={<FolderOpen fontSize="inherit" />} href="/incidents" />
          <KpiCard label="Staff" value={staff.data.length} hint="Analysts and admins" icon={<GroupIcon fontSize="inherit" />} href="/team" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Open incidents per staff member">
            {workload.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">The server returned no staff accounts.</p>
            ) : (
              <WorkloadChart workload={workload} />
            )}
          </Card>
          <Card title="Incidents per day, last 14 days">
            <TrendChart buckets={trend} />
          </Card>
          <Card title="SLA watchlist" action={<span className="text-xs text-muted">closest to breach first</span>} flush id="sla-watchlist">
            <SlaWatchlist incidents={data} now={now} />
          </Card>
          <Card title="Team performance" flush>
            <TeamPerformance workload={workload} />
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Command center" description="SLA risk, workload and trends across the whole team." />
      {body}
    </>
  );
}
