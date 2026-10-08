"use client";

import Link from "next/link";
import AddAlert from "@mui/icons-material/AddAlert";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Description from "@mui/icons-material/Description";
import FolderOpen from "@mui/icons-material/FolderOpen";
import { CaseCard } from "@/components/portal/CaseCard";
import { LatestUpdates } from "@/components/portal/LatestUpdates";
import { buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { KpiCard } from "@/components/ui/KpiCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useIncidents } from "@/hooks/useIncidents";
import { isOpen } from "@/lib/domain/incident";

const ACTIVE_CASES_SHOWN = 3;

export function PortalOverview() {
  const { data, error, isLoading, mutate } = useIncidents();

  if (isLoading || (!data && !error)) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (error || !data) return <ErrorState error={error} onRetry={() => void mutate()} />;

  const open = data.filter(isOpen).sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());
  const active = open.slice(0, ACTIVE_CASES_SHOWN);

  return (
    <div className="space-y-6">
      <Card className="border-accent/40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">See something that looks wrong?</h2>
            <p className="mt-1 text-sm text-muted">
              Reporting takes a few minutes, and a false alarm is always fine.
            </p>
          </div>
          <Link href="/portal/report" className={buttonClass("primary")}>
            <AddAlert fontSize="inherit" />
            Report an incident
          </Link>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="My reports" value={data.length} icon={<Description fontSize="inherit" />} href="/portal/cases" />
        <KpiCard
          label="Open"
          value={open.length}
          icon={<FolderOpen fontSize="inherit" />}
          href="/portal/cases?filter=open"
        />
        <KpiCard
          label="Resolved"
          value={data.length - open.length}
          icon={<CheckCircle fontSize="inherit" />}
          href="/portal/cases?filter=resolved"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Active cases</h2>
            <Link href="/portal/cases" className="text-sm text-accent-text hover:underline">
              All cases
            </Link>
          </div>
          {active.length === 0 ? (
            <Card>
              <EmptyState title="No open cases" description="Cases you report will show up here while they are being handled." />
            </Card>
          ) : (
            active.map((incident) => <CaseCard key={incident.id} incident={incident} />)
          )}
        </div>
        <LatestUpdates incidentIds={active.map((incident) => incident.id)} />
      </div>
    </div>
  );
}
