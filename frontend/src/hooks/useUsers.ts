"use client";

import useSWR from "swr";
import { useAuthedKey } from "@/hooks/useAuthedKey";
import { listUsers } from "@/lib/api/users";
import { isAdmin } from "@/lib/auth/permissions";

export const USERS_KEY = "/users";

// ADMIN only: every account, for role management.
export function useUsers() {
  const key = useAuthedKey(USERS_KEY, isAdmin);
  return useSWR(key, listUsers);
}
