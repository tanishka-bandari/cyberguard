"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { safeNext } from "@/lib/auth/access";

// Once a session exists (just signed in, or already signed in), leave the auth page.
// Uses useSearchParams, so the calling component must be inside <Suspense>.
export function useAuthRedirect() {
  const { status, user } = useSession();
  const router = useRouter();
  const next = useSearchParams().get("next");

  useEffect(() => {
    if (status === "authenticated" && user) router.replace(safeNext(next, user.role));
  }, [status, user, next, router]);
}
