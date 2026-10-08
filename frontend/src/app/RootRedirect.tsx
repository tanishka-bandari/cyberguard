"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { homeFor } from "@/lib/auth/access";

// "/" has no content of its own: send people to login or to their role's home page.
export function RootRedirect() {
  const { status, user } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "anonymous") router.replace("/login");
    else if (user) router.replace(homeFor(user.role));
  }, [status, user, router]);

  return (
    <div role="status" className="grid min-h-dvh place-items-center text-sm text-muted">
      Loading...
    </div>
  );
}
