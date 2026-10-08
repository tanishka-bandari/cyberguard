"use client";

import { useSession } from "@/hooks/useSession";
import type { User } from "@/types/domain";

// SWR does not fetch while the key is null, so requests wait for a signed-in user
// (and, when allow is given, for a user that the backend will accept).
export function useAuthedKey(key: string | null, allow?: (user: User) => boolean): string | null {
  const { status, user } = useSession();
  if (status !== "authenticated" || !user || key === null) return null;
  if (allow && !allow(user)) return null;
  return key;
}
