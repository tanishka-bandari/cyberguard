import AssignmentInd from "@mui/icons-material/AssignmentInd";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import FolderOpen from "@mui/icons-material/FolderOpen";
import Inventory2 from "@mui/icons-material/Inventory2";
import PersonOff from "@mui/icons-material/PersonOff";
import Report from "@mui/icons-material/Report";
import { KpiCard } from "@/components/ui/KpiCard";
import { isAdmin } from "@/lib/auth/permissions";
import { STATUS_GROUP, isOpen } from "@/lib/domain/incident";
import { UNASSIGNED } from "@/lib/domain/filters";
import type { Incident, User } from "@/types/domain";

interface DashboardKpisProps {
  incidents: readonly Incident[]; // already limited to the date range
  rangeLabel: string;
  user: User;
  hrefFor: (extra?: Record<string, string>) => string;
}

// Each card counts the whole date range and links to the matching filtered view.
export function DashboardKpis({ incidents, rangeLabel, user, hrefFor }: DashboardKpisProps) {
  const open = incidents.filter(isOpen);
  const mine = open.filter((i) => i.assignee?.id === user.id);
  const solved = incidents.filter((i) => STATUS_GROUP[i.status] === "solved");
  const hint = rangeLabel.toLowerCase();

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      <KpiCard label="Open" value={open.length} hint={hint} icon={<FolderOpen fontSize="inherit" />} href={hrefFor({ open: "1" })} />
      <KpiCard
        label="Critical open"
        value={open.filter((i) => i.severity === "CRITICAL").length}
        hint={hint}
        icon={<Report fontSize="inherit" />}
        href={hrefFor({ open: "1", severity: "CRITICAL" })}
      />
      <KpiCard
        label="Unassigned open"
        value={open.filter((i) => !i.assignee).length}
        hint={hint}
        icon={<PersonOff fontSize="inherit" />}
        href={hrefFor({ open: "1", assignee: UNASSIGNED })}
      />
      {isAdmin(user) ? (
        <KpiCard
          label="Resolved"
          value={solved.length}
          hint={hint}
          icon={<CheckCircleOutlined fontSize="inherit" />}
          href={hrefFor({ group: "solved" })}
        />
      ) : (
        <KpiCard
          label="Assigned to me"
          value={mine.length}
          hint={`open, ${hint}`}
          icon={<AssignmentInd fontSize="inherit" />}
          href={hrefFor({ open: "1", assignee: String(user.id) })}
        />
      )}
      <KpiCard label="Total reported" value={incidents.length} hint={hint} icon={<Inventory2 fontSize="inherit" />} href={hrefFor()} />
    </div>
  );
}
