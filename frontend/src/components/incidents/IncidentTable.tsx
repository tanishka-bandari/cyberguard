"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Progress } from "@/components/ui/Progress";
import { RiskMeter } from "@/components/ui/RiskMeter";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { STATUSES, TYPE_LABEL, isOpen, progressOf, severityRank } from "@/lib/domain/incident";
import { timeAgo } from "@/lib/format";
import type { Incident } from "@/types/domain";

interface IncidentTableProps {
  incidents: readonly Incident[];
  // Where a row's title links to, e.g. (i) => `/incidents/${i.id}` or `/portal/cases/${i.id}`.
  // Open critical rows are highlighted.
  hrefFor: (incident: Incident) => string;
  onRowClick?: (incident: Incident) => void;
  showReporter?: boolean;
  pageSize?: number;
  empty?: ReactNode;
}

export function IncidentTable({
  incidents,
  hrefFor,
  onRowClick,
  showReporter = true,
  pageSize = 10,
  empty,
}: IncidentTableProps) {
  const columns = useMemo<Column<Incident>[]>(
    () => [
      {
        key: "id",
        header: "ID",
        sortValue: (i) => i.id,
        cell: (i) => <span className="font-mono text-xs text-muted">#{i.id}</span>,
      },
      {
        key: "title",
        header: "Title",
        sortValue: (i) => i.title.toLowerCase(),
        cell: (i) => (
          <Link
            href={hrefFor(i)}
            data-critical-open={i.severity === "CRITICAL" && isOpen(i) ? "" : undefined}
            className="font-medium hover:text-accent-text hover:underline"
          >
            {i.title}
          </Link>
        ),
      },
      { key: "type", header: "Type", sortValue: (i) => TYPE_LABEL[i.type], cell: (i) => TYPE_LABEL[i.type] },
      {
        key: "severity",
        header: "Severity",
        sortValue: (i) => severityRank(i.severity),
        cell: (i) => <SeverityBadge severity={i.severity} />,
      },
      {
        key: "status",
        header: "Status",
        sortValue: (i) => STATUSES.indexOf(i.status),
        cell: (i) => <StatusBadge status={i.status} />,
      },
      { key: "risk", header: "Risk", sortValue: (i) => i.riskScore, cell: (i) => <RiskMeter value={i.riskScore} /> },
      ...(showReporter
        ? [{ key: "reporter", header: "Reporter", sortValue: (i: Incident) => i.reporter.name, cell: (i: Incident) => i.reporter.name }]
        : []),
      {
        key: "assignee",
        header: "Assignee",
        sortValue: (i) => i.assignee?.name ?? "",
        cell: (i) => i.assignee?.name ?? <span className="text-muted">Unassigned</span>,
      },
      {
        key: "progress",
        header: "Progress",
        sortValue: progressOf,
        cell: (i) => (
          <div className="flex min-w-28 items-center gap-2">
            <Progress value={progressOf(i)} label={`Progress of incident ${i.id}`} />
            <span className="w-9 text-right font-mono text-xs tabular-nums">{progressOf(i)}%</span>
          </div>
        ),
      },
      {
        key: "reportedAt",
        header: "Age",
        sortValue: (i) => i.reportedAt.getTime(),
        cell: (i) => <time dateTime={i.reportedAt.toISOString()}>{timeAgo(i.reportedAt)}</time>,
      },
    ],
    [hrefFor, showReporter],
  );

  return (
    <div className="[&_tr:has([data-critical-open])]:bg-critical/10 [&_tr:has([data-critical-open])>td:first-child]:shadow-[inset_3px_0_0_var(--critical)]">
      <DataTable
        caption="Incidents"
        columns={columns}
        rows={incidents}
        rowKey={(i) => i.id}
        pageSize={pageSize}
        initialSort={{ key: "reportedAt", dir: "desc" }}
        onRowClick={onRowClick}
        empty={empty}
      />
    </div>
  );
}
