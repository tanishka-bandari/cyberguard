"use client";

import { useSession } from "@/hooks/useSession";
import type { Role } from "@/types/domain";

// SWR does not fetch while the key is null, so requests wait for a signed-in user
// (and, when roles is given, for a user that the backend will accept).
export function useAuthedKey(key: string | null, roles?: readonly Role[]): string | null {
  const { status, user } = useSession();
  if (status !== "authenticated" || !user || key === null) return null;
  if (roles && !roles.includes(user.role)) return null;
  return key;
}
