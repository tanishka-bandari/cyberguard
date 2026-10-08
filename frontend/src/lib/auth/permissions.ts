import type { Incident, Role, User } from "@/types/domain";

export type Action =
  | "incident:create"
  | "incident:changeStatus"
  | "incident:assign"
  | "incident:delete"
  | "note:read"
  | "note:add"
  | "evidence:read"
  | "evidence:upload"
  | "audit:readIncident"
  | "audit:readRecent"
  | "users:manage";

export const STAFF_ROLES: readonly Role[] = ["ANALYST", "ADMIN"];

export const isStaff = (user: User) => STAFF_ROLES.includes(user.role);
export const isAdmin = (user: User) => user.role === "ADMIN";
const owns = (user: User, incident?: Incident) => !!incident && incident.reporter.id === user.id;

// Every UI decision about "may this user do X" goes through here.
// The backend enforces the same rules; this only decides what to show.
export function can(user: User | null, action: Action, incident?: Incident): boolean {
  if (!user) return false;
  switch (action) {
    case "incident:create":
      return true;
    case "incident:changeStatus":
    case "note:add":
    case "audit:readRecent":
      return isStaff(user);
    case "incident:assign":
    case "incident:delete":
    case "users:manage":
      return isAdmin(user);
    case "note:read":
    case "evidence:read":
    case "evidence:upload":
    case "audit:readIncident":
      return isStaff(user) || owns(user, incident);
  }
}
