"use client";

import { SAFETY_TIPS } from "@/components/portal/safetyGuidance";
import { TypeIcon } from "@/components/portal/TypeIcon";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useIncidents } from "@/hooks/useIncidents";
import { INCIDENT_TYPES, TYPE_LABEL } from "@/lib/domain/incident";

export function SafetyTips() {
  const { data } = useIncidents();
  const reported = new Set(data?.map((incident) => incident.type));
  // Array.sort is stable, so types keep their usual order within each group.
  const types = [...INCIDENT_TYPES].sort((a, b) => Number(reported.has(b)) - Number(reported.has(a)));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {types.map((type) => (
        <Card
          key={type}
          title={
            <span className="flex items-center gap-2">
              <span className="text-lg text-accent-text">
                <TypeIcon type={type} />
              </span>
              {TYPE_LABEL[type]}
            </span>
          }
          action={reported.has(type) ? <Badge tone="accent">You reported this</Badge> : undefined}
        >
          <ul className="list-inside list-disc space-y-1.5 text-sm marker:text-muted">
            {SAFETY_TIPS[type].map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
