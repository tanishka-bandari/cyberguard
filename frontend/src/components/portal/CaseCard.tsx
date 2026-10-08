import Link from "next/link";
import { Progress } from "@/components/ui/Progress";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatusStepper } from "@/components/ui/StatusStepper";
import { TYPE_LABEL, progressOf } from "@/lib/domain/incident";
import { timeAgo } from "@/lib/format";
import type { Incident } from "@/types/domain";

export function CaseCard({ incident }: { incident: Incident }) {
  return (
    <article className="relative space-y-3 rounded-lg border border-border bg-panel p-4 transition-colors focus-within:border-accent hover:border-accent">
      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge severity={incident.severity} />
        <StatusBadge status={incident.status} />
      </div>
      <h3 className="font-semibold">
        <Link href={`/portal/cases/${incident.id}`} className="break-words after:absolute after:inset-0">
          <span className="font-mono text-muted">#{incident.id}</span> {incident.title}
        </Link>
      </h3>
      <p className="text-sm text-muted">
        {TYPE_LABEL[incident.type]} · reported {timeAgo(incident.reportedAt)} ·{" "}
        {incident.assignee ? `handled by ${incident.assignee.name}` : "Waiting for assignment"}
      </p>
      <Progress value={progressOf(incident)} label={`Case ${incident.id} progress`} />
      <StatusStepper status={incident.status} />
    </article>
  );
}
