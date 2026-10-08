"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { INCIDENTS_KEY } from "@/hooks/useIncidents";
import { useSession } from "@/hooks/useSession";
import { assignIncident } from "@/lib/api/incidents";
import { can } from "@/lib/auth/permissions";
import { isOpen } from "@/lib/domain/incident";
import { unassignedOpen } from "@/lib/domain/stats";
import { toast } from "@/lib/toast";
import type { Incident, User } from "@/types/domain";

interface StaffDialogProps {
  person: User | null;
  incidents: readonly Incident[];
  onClose: () => void;
}

function IncidentLine({ incident, action }: { incident: Incident; action?: ReactNode }) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
      <div className="min-w-0 flex-1 basis-40">
        <Link href={`/incidents/${incident.id}`} className="block truncate text-sm font-medium hover:text-accent-text hover:underline">
          <span className="mr-2 font-mono text-xs text-muted">#{incident.id}</span>
          {incident.title}
        </Link>
      </div>
      <SeverityBadge severity={incident.severity} />
      <StatusBadge status={incident.status} />
      {action}
    </li>
  );
}

export function StaffDialog({ person, incidents, onClose }: StaffDialogProps) {
  const { user } = useSession();
  const { mutate } = useSWRConfig();
  const [assigningId, setAssigningId] = useState<number | null>(null);

  const assigned = person
    ? incidents.filter((i) => i.assignee?.id === person.id).sort((a, b) => Number(isOpen(b)) - Number(isOpen(a)))
    : [];
  const canAssign = can(user, "incident:assign");
  const available = canAssign ? unassignedOpen(incidents) : [];

  async function assign(incident: Incident) {
    if (!person) return;
    setAssigningId(incident.id);
    try {
      await assignIncident(incident.id, person.id);
      await mutate(INCIDENTS_KEY);
      toast.success(`Assigned #${incident.id} to ${person.name}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not assign the incident");
    } finally {
      setAssigningId(null);
    }
  }

  return (
    <Dialog open={person !== null} onClose={onClose} title={person?.name ?? ""}>
      <h3 className="text-sm font-semibold">Assigned incidents ({assigned.length})</h3>
      {assigned.length === 0 ? (
        <p className="py-3 text-sm text-muted">Nothing is assigned to this person.</p>
      ) : (
        <ul className="max-h-60 divide-y divide-border overflow-y-auto">
          {assigned.map((i) => (
            <IncidentLine key={i.id} incident={i} />
          ))}
        </ul>
      )}
      {canAssign && (
        <>
          <h3 className="mt-5 text-sm font-semibold">Unassigned open incidents ({available.length})</h3>
          {available.length === 0 ? (
            <p className="py-3 text-sm text-muted">Every open incident has an owner.</p>
          ) : (
            <ul className="max-h-60 divide-y divide-border overflow-y-auto">
              {available.map((i) => (
                <IncidentLine
                  key={i.id}
                  incident={i}
                  action={
                    <Button size="sm" loading={assigningId === i.id} disabled={assigningId !== null} onClick={() => void assign(i)}>
                      Assign
                    </Button>
                  }
                />
              ))}
            </ul>
          )}
        </>
      )}
    </Dialog>
  );
}
