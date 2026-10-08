"use client";

import useSWR from "swr";
import { useAuthedKey } from "@/hooks/useAuthedKey";
import { listStaff } from "@/lib/api/users";

export const STAFF_KEY = "/users/staff";

// ANALYST and ADMIN accounts, for assignee pickers and the team view.
export function useStaff() {
  const key = useAuthedKey(STAFF_KEY, ["ANALYST", "ADMIN"]);
  return useSWR(key, listStaff);
}
