import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { RiskMeter } from "@/components/ui/RiskMeter";
import { TYPE_LABEL } from "@/lib/domain/incident";
import { formatDateTime, timeAgo } from "@/lib/format";
import type { Incident } from "@/types/domain";

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

export function IncidentInfo({ incident }: { incident: Incident }) {
  return (
    <Card title="Details">
      <dl className="grid grid-cols-2 gap-4">
        <Item label="Reporter">
          {incident.reporter.name}
          <span className="block break-all text-xs text-muted">{incident.reporter.email}</span>
        </Item>
        <Item label="Assignee">
          {incident.assignee ? (
            <>
              {incident.assignee.name}
              <span className="block break-all text-xs text-muted">{incident.assignee.email}</span>
            </>
          ) : (
            <span className="text-muted">Unassigned</span>
          )}
        </Item>
        <Item label="Type">{TYPE_LABEL[incident.type]}</Item>
        <Item label="Risk">
          <RiskMeter value={incident.riskScore} />
        </Item>
        <Item label="Reported">{formatDateTime(incident.reportedAt)}</Item>
        <Item label="Age">{timeAgo(incident.reportedAt)}</Item>
      </dl>
    </Card>
  );
}
