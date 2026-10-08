"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { SWRConfig } from "swr";
import { Toaster } from "@/components/ui/Toaster";
import { SessionProvider } from "@/hooks/useSession";
import { configureApi } from "@/lib/api/client";
import { clearSession, getSession } from "@/lib/auth/session";

// Runs when this module loads (before any component effect), so the very first
// request already carries the token.
configureApi({
  getToken: () => getSession()?.token ?? null,
  onUnauthorized: () => {
    clearSession();
    if (window.location.pathname.startsWith("/login")) return;
    const here = window.location.pathname + window.location.search;
    window.location.replace(`/login?next=${encodeURIComponent(here)}`);
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <SWRConfig value={{ shouldRetryOnError: false, revalidateOnFocus: true }}>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </SWRConfig>
    </ThemeProvider>
  );
}
