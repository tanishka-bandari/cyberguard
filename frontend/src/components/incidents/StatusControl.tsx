import { Button, type ButtonVariant } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusStepper } from "@/components/ui/StatusStepper";
import { canMoveTo, isOpen } from "@/lib/domain/incident";
import type { Incident, IncidentStatus } from "@/types/domain";

interface QuickAction {
  label: string;
  target: IncidentStatus;
  variant: ButtonVariant;
  visible: (incident: Incident) => boolean;
}

const QUICK_ACTIONS: readonly QuickAction[] = [
  {
    label: "Investigate",
    target: "UNDER_INVESTIGATION",
    variant: "primary",
    visible: (i) => i.status === "REPORTED" || i.status === "TRIAGED" || i.status === "ASSIGNED",
  },
  { label: "Contain", target: "CONTAINED", variant: "secondary", visible: (i) => i.status === "UNDER_INVESTIGATION" },
  {
    label: "Resolve",
    target: "RESOLVED",
    variant: "secondary",
    visible: (i) => i.status === "UNDER_INVESTIGATION" || i.status === "CONTAINED",
  },
  { label: "Close", target: "CLOSED", variant: "secondary", visible: (i) => i.status === "RESOLVED" },
];

interface StatusControlProps {
  incident: Incident;
  // Staff can move the incident; everyone else just sees where it stands.
  editable: boolean;
  busy: boolean;
  onChange: (status: IncidentStatus) => void;
}

export function StatusControl({ incident, editable, busy, onChange }: StatusControlProps) {
  if (!editable) {
    return (
      <Card title="Progress">
        <StatusStepper status={incident.status} />
      </Card>
    );
  }

  const reopenTarget: IncidentStatus = incident.assignee ? "UNDER_INVESTIGATION" : "REPORTED";
  return (
    <Card title="Status">
      <StatusStepper
        status={incident.status}
        onSelect={onChange}
        disabled={(step) => busy || !canMoveTo(incident, step)}
      />
      {!incident.assignee && (
        <p className="mt-2 text-xs text-muted">
          Assign someone first: Assigned, Under investigation and Contained need an assignee.
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_ACTIONS.filter((a) => a.visible(incident) && canMoveTo(incident, a.target)).map((a) => (
          <Button key={a.label} size="sm" variant={a.variant} disabled={busy} onClick={() => onChange(a.target)}>
            {a.label}
          </Button>
        ))}
        {!isOpen(incident) && (
          <Button size="sm" disabled={busy} onClick={() => onChange(reopenTarget)}>
            Reopen
          </Button>
        )}
      </div>
    </Card>
  );
}
