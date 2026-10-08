import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { OVERLOADED_OPEN, type StaffWorkload } from "@/lib/domain/stats";

const ROLE_LABEL = { ANALYST: "Analyst", ADMIN: "Admin", USER: "User" } as const;

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dd className="text-lg font-semibold tabular-nums">{value}</dd>
      <dt className="text-xs text-muted">{label}</dt>
    </div>
  );
}

export function StaffCard({ workload, onOpen }: { workload: StaffWorkload; onOpen: () => void }) {
  const { person, open, resolved, rate } = workload;
  const overloaded = open >= OVERLOADED_OPEN;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${person.name}, ${open} open incidents. Show assigned incidents`}
      className="h-full w-full rounded-lg border border-border bg-panel p-4 text-left transition-colors hover:border-accent"
    >
      <div className="flex items-center gap-3">
        <Avatar name={person.name} className="size-10 text-sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{person.name}</p>
          <p className="truncate text-xs text-muted">
            {ROLE_LABEL[person.role]} - {person.email}
          </p>
        </div>
        {overloaded && <Badge tone="critical">Overloaded</Badge>}
      </div>
      <div
        role="progressbar"
        aria-label={`Workload: ${open} of ${OVERLOADED_OPEN} open incidents before overload`}
        aria-valuemin={0}
        aria-valuemax={OVERLOADED_OPEN}
        aria-valuenow={Math.min(open, OVERLOADED_OPEN)}
        className="mt-4 h-1.5 overflow-hidden rounded-full bg-hover"
      >
        <div
          className={cn("h-full rounded-full", overloaded ? "bg-critical" : "bg-accent")}
          style={{ width: `${Math.min(100, (open / OVERLOADED_OPEN) * 100)}%` }}
        />
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Active" value={open} />
        <Stat label="Solved" value={resolved} />
        <Stat label="Resolution rate" value={rate === null ? "-" : `${rate}%`} />
      </dl>
    </button>
  );
}
