"use client";

import useSWR from "swr";
import { useAuthedKey } from "@/hooks/useAuthedKey";
import { listUsers } from "@/lib/api/users";

export const USERS_KEY = "/users";

// ADMIN only: every account, for role management.
export function useUsers() {
  const key = useAuthedKey(USERS_KEY, ["ADMIN"]);
  return useSWR(key, listUsers);
}
