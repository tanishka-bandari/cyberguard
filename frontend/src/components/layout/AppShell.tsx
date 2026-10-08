"use client";

import { useState, type ReactNode } from "react";
import { CriticalBanner } from "@/components/layout/CriticalBanner";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useNewIncidentAlerts } from "@/hooks/useNewIncidentAlerts";

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { critical, dismiss } = useNewIncidentAlerts();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh lg:block">
        <Sidebar />
      </aside>
      <div className="flex min-w-0 flex-col">
        <Topbar onOpenMenu={() => setMenuOpen(true)} />
        <CriticalBanner incident={critical} onDismiss={dismiss} />
        <main id="main" tabIndex={-1} className="flex-1 p-4 outline-none sm:p-6">
          {children}
        </main>
      </div>
      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
