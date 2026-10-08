import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { OVERLOADED_OPEN, type StaffWorkload } from "@/lib/domain/stats";

const columns: Column<StaffWorkload>[] = [
  {
    key: "name",
    header: "Staff member",
    sortValue: (w) => w.person.name.toLowerCase(),
    cell: (w) => (
      <span className="flex items-center gap-2 font-medium">
        <Avatar name={w.person.name} className="size-7" />
        {w.person.name}
      </span>
    ),
  },
  { key: "assigned", header: "Assigned", sortValue: (w) => w.assigned, cell: (w) => w.assigned, className: "tabular-nums" },
  { key: "open", header: "Open", sortValue: (w) => w.open, cell: (w) => w.open, className: "tabular-nums" },
  { key: "resolved", header: "Resolved", sortValue: (w) => w.resolved, cell: (w) => w.resolved, className: "tabular-nums" },
  {
    key: "rate",
    header: "Resolution rate",
    sortValue: (w) => w.rate ?? -1,
    cell: (w) => (w.rate === null ? <span className="text-muted">No cases</span> : `${w.rate}%`),
    className: "tabular-nums",
  },
  {
    key: "flag",
    header: "Load",
    cell: (w) =>
      w.open >= OVERLOADED_OPEN ? (
        <Badge tone="critical">Overloaded</Badge>
      ) : w.open === 0 ? (
        <Badge>Idle</Badge>
      ) : (
        <span className="text-muted">Normal</span>
      ),
  },
];

export function TeamPerformance({ workload }: { workload: readonly StaffWorkload[] }) {
  return (
    <DataTable
      caption="Team performance"
      columns={columns}
      rows={workload}
      rowKey={(w) => w.person.id}
      initialSort={{ key: "resolved", dir: "desc" }}
      empty={<p className="px-4 py-8 text-center text-sm text-muted">The server returned no staff accounts.</p>}
    />
  );
}
