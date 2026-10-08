import { STAFF_ROLES } from "@/lib/auth/permissions";
import type { Role } from "@/types/domain";

// The single route-access table. The sidebar and AuthGuard are both derived from it.
// A path is governed by its longest matching prefix.
export interface RouteRule {
  prefix: string;
  roles: readonly Role[];
  nav?: { label: string; section: "Operations" | "Administration" | "Reporting" };
}

export const ROUTES: readonly RouteRule[] = [
  { prefix: "/dashboard", roles: STAFF_ROLES, nav: { label: "Dashboard", section: "Operations" } },
  { prefix: "/incidents", roles: STAFF_ROLES, nav: { label: "Incidents", section: "Operations" } },
  { prefix: "/team", roles: STAFF_ROLES, nav: { label: "Team", section: "Operations" } },
  {
    prefix: "/admin/command-center",
    roles: ["ADMIN"],
    nav: { label: "Command center", section: "Administration" },
  },
  { prefix: "/admin/triage", roles: ["ADMIN"], nav: { label: "Triage", section: "Administration" } },
  { prefix: "/admin/users", roles: ["ADMIN"], nav: { label: "Users", section: "Administration" } },
  { prefix: "/portal/report", roles: ["USER"], nav: { label: "Report incident", section: "Reporting" } },
  { prefix: "/portal/cases", roles: ["USER"], nav: { label: "My cases", section: "Reporting" } },
  { prefix: "/portal/safety", roles: ["USER"], nav: { label: "Stay safe", section: "Reporting" } },
  { prefix: "/portal", roles: ["USER"], nav: { label: "Overview", section: "Reporting" } },
];

const HOME: Record<Role, string> = {
  USER: "/portal",
  ANALYST: "/dashboard",
  ADMIN: "/admin/command-center",
};

export const homeFor = (role: Role) => HOME[role];

const matches = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

function ruleFor(pathname: string): RouteRule | undefined {
  return ROUTES.filter((r) => matches(pathname, r.prefix)).sort(
    (a, b) => b.prefix.length - a.prefix.length,
  )[0];
}

// Paths not in the table (for example /) are open to any signed-in user.
export function canAccess(role: Role, pathname: string): boolean {
  const rule = ruleFor(pathname);
  return !rule || rule.roles.includes(role);
}

export const navFor = (role: Role) => ROUTES.filter((r) => r.nav && r.roles.includes(role));

export function isActive(pathname: string, prefix: string): boolean {
  return prefix === "/portal" ? pathname === prefix : matches(pathname, prefix);
}

// Where to go after signing in: the requested page if it is a local path this role may open.
export function safeNext(next: string | null, role: Role): string {
  if (!next || !/^\/(?![/\\])/.test(next)) return homeFor(role);
  const path = next.split(/[?#]/)[0];
  return path === "/login" || path === "/register" || !canAccess(role, path) ? homeFor(role) : next;
}
