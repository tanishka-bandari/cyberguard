"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import AdminPanelSettings from "@mui/icons-material/AdminPanelSettingsOutlined";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import LocalFireDepartmentOutlined from "@mui/icons-material/LocalFireDepartmentOutlined";
import ManageAccountsOutlined from "@mui/icons-material/ManageAccountsOutlined";
import ReportGmailerrorredOutlined from "@mui/icons-material/ReportGmailerrorredOutlined";
import SecurityOutlined from "@mui/icons-material/SecurityOutlined";
import { Badge } from "@/components/ui/Badge";
import { useIncidents } from "@/hooks/useIncidents";
import { useSession } from "@/hooks/useSession";
import { cn } from "@/lib/cn";
import { isActive, navFor } from "@/lib/auth/access";
import { isOpen } from "@/lib/domain/incident";
import type { Incident } from "@/types/domain";

const ICONS: Record<string, ComponentType<SvgIconProps>> = {
  "/dashboard": DashboardOutlined,
  "/incidents": AssignmentOutlined,
  "/team": GroupsOutlined,
  "/admin/command-center": AdminPanelSettings,
  "/admin/triage": LocalFireDepartmentOutlined,
  "/admin/users": ManageAccountsOutlined,
  "/portal": HomeOutlined,
  "/portal/report": ReportGmailerrorredOutlined,
  "/portal/cases": FactCheckOutlined,
  "/portal/safety": SecurityOutlined,
};

// Only the counts that tell someone what needs doing.
const COUNTS: Record<string, (incidents: Incident[]) => number> = {
  "/incidents": (list) => list.filter(isOpen).length,
  "/admin/triage": (list) => list.filter((i) => i.status === "REPORTED").length,
  "/portal/cases": (list) => list.filter(isOpen).length,
};

export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useSession();
  const pathname = usePathname();
  const { data: incidents } = useIncidents();
  if (!user) return null;

  const items = navFor(user.role);
  const sections = [...new Set(items.map((r) => r.nav!.section))];

  return (
    <nav aria-label="Main" className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {sections.map((section) => (
        <div key={section}>
          <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-muted">{section}</p>
          <ul className="space-y-0.5">
            {items
              .filter((r) => r.nav!.section === section)
              .map((rule) => {
                const Icon = ICONS[rule.prefix];
                const active = isActive(pathname, rule.prefix);
                const count = incidents ? COUNTS[rule.prefix]?.(incidents) : undefined;
                return (
                  <li key={rule.prefix}>
                    <Link
                      href={rule.prefix}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                        active ? "bg-accent/15 text-accent-text" : "text-muted hover:bg-hover hover:text-fg",
                      )}
                    >
                      <span className="text-lg">
                        <Icon fontSize="inherit" />
                      </span>
                      <span className="flex-1">{rule.nav!.label}</span>
                      {count ? <Badge tone={active ? "accent" : "neutral"}>{count}</Badge> : null}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
