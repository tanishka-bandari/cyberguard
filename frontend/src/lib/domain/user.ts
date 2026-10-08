import type { Role } from "@/types/domain";

export const ROLES: readonly Role[] = ["USER", "ANALYST", "ADMIN"];

export const ROLE_LABEL: Record<Role, string> = { USER: "Reporter", ANALYST: "Analyst", ADMIN: "Admin" };
