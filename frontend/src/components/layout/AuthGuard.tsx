"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { canAccess, homeFor } from "@/lib/auth/access";

function PageLoading() {
  return (
    <div role="status" className="grid min-h-dvh place-items-center text-sm text-muted">
      Loading...
    </div>
  );
}

// Signed out -> /login?next=<here>. Signed in but wrong role -> that role's home page.
export function AuthGuard({ children }: { children: ReactNode }) {
  const { status, user } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const allowed = !!user && canAccess(user.role, pathname);

  useEffect(() => {
    if (status === "anonymous") {
      const here = pathname + window.location.search;
      router.replace(`/login?next=${encodeURIComponent(here)}`);
    } else if (user && !allowed) {
      router.replace(homeFor(user.role));
    }
  }, [status, user, allowed, pathname, router]);

  if (status !== "authenticated" || !allowed) return <PageLoading />;
  return <>{children}</>;
}
