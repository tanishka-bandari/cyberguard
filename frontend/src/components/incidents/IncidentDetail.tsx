"use client";

import Link from "next/link";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { AssignSelect } from "@/components/incidents/AssignSelect";
import { DeleteIncident } from "@/components/incidents/DeleteIncident";
import { EvidencePanel } from "@/components/incidents/EvidencePanel";
import { IncidentInfo } from "@/components/incidents/IncidentInfo";
import { NotesPanel } from "@/components/incidents/NotesPanel";
import { StatusControl } from "@/components/incidents/StatusControl";
import { Timeline } from "@/components/incidents/Timeline";
import { useIncidentActions } from "@/components/incidents/useIncidentActions";
import { buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useIncident } from "@/hooks/useIncident";
import { useSession } from "@/hooks/useSession";
import { ApiError } from "@/lib/api/client";
import { can } from "@/lib/auth/permissions";
import type { Incident } from "@/types/domain";

interface IncidentDetailProps {
  id: number;
  // The list this page belongs to; used for the back link and after a delete.
  listHref: string;
  listLabel: string;
}

function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
      <ArrowBack fontSize="inherit" />
      {label}
    </Link>
  );
}

export function IncidentDetail({ id, listHref, listLabel }: IncidentDetailProps) {
  const { incident, error, isLoading, mutate, notFound } = useIncident(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const forbidden = error instanceof ApiError && error.status === 403;
  if (error && !incident) {
    return (
      <>
        <BackLink href={listHref} label={listLabel} />
        <ErrorState title={forbidden ? "You cannot open this incident" : "Could not load this incident"} error={error} onRetry={() => mutate()} />
      </>
    );
  }

  if (notFound || !incident) {
    return (
      <>
        <BackLink href={listHref} label={listLabel} />
        <EmptyState
          title="Incident not found"
          description="It may have been deleted, or it belongs to someone else and you do not have access to it."
          action={
            <Link href={listHref} className={buttonClass("secondary")}>
              Back to {listLabel.toLowerCase()}
            </Link>
          }
        />
      </>
    );
  }

  return <IncidentView incident={incident} listHref={listHref} listLabel={listLabel} />;
}

function IncidentView({ incident, listHref, listLabel }: { incident: Incident; listHref: string; listLabel: string }) {
  const { user } = useSession();
  const actions = useIncidentActions(incident, listHref);

  return (
    <>
      <BackLink href={listHref} label={listLabel} />
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-muted">Incident #{incident.id}</p>
          <h1 className="break-words text-2xl font-semibold tracking-tight">{incident.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>
        </div>
        {can(user, "incident:delete") && (
          <DeleteIncident incident={incident} busy={actions.busy} onConfirm={actions.remove} />
        )}
      </header>

      <div className="mb-4">
        <StatusControl
          incident={incident}
          editable={can(user, "incident:changeStatus")}
          busy={actions.busy}
          onChange={actions.changeStatus}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card title="Description">
            <p className="whitespace-pre-wrap break-words text-sm">{incident.description}</p>
          </Card>
          {can(user, "note:read", incident) && <NotesPanel incident={incident} />}
          {can(user, "evidence:read", incident) && <EvidencePanel incident={incident} />}
        </div>
        <div className="space-y-4">
          <IncidentInfo incident={incident} />
          {can(user, "incident:assign") && (
            <Card title="Assignment">
              <AssignSelect
                incident={incident}
                disabled={actions.busy}
                onAssign={actions.assign}
                onUnassign={actions.unassign}
              />
            </Card>
          )}
          {can(user, "audit:readIncident", incident) && <Timeline incidentId={incident.id} />}
        </div>
      </div>
    </>
  );
}
