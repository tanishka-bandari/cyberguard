"use client";

import useSWR from "swr";
import { useAuthedKey } from "@/hooks/useAuthedKey";
import { listStaff } from "@/lib/api/users";
import { isStaff } from "@/lib/auth/permissions";

export const STAFF_KEY = "/users/staff";

// ANALYST and ADMIN accounts, for assignee pickers and the team view.
export function useStaff() {
  const key = useAuthedKey(STAFF_KEY, isStaff);
  return useSWR(key, listStaff);
}
