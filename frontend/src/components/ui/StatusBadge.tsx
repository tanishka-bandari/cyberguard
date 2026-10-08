import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { STATUS_GROUP, STATUS_LABEL, type StatusGroup } from "@/lib/domain/incident";
import type { IncidentStatus } from "@/types/domain";

const GROUP_TONE: Record<StatusGroup, BadgeTone> = {
  reported: "info",
  assigned: "neutral",
  progress: "medium",
  solved: "accent",
};

export function StatusBadge({ status }: { status: IncidentStatus }) {
  return <Badge tone={GROUP_TONE[STATUS_GROUP[status]]}>{STATUS_LABEL[status]}</Badge>;
}
