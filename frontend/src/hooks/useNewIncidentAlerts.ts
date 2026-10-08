"use client";

import { useEffect, useRef, useState } from "react";
import { useIncidents } from "@/hooks/useIncidents";
import { useSession } from "@/hooks/useSession";
import { toast } from "@/lib/toast";
import type { Incident } from "@/types/domain";

// Watches the polled incident list (staff only). A new incident raises a toast;
// a new CRITICAL one also returns an incident to show in a banner until dismissed.
export function useNewIncidentAlerts() {
  const { user } = useSession();
  const { data } = useIncidents();
  const seen = useRef<Set<number> | null>(null);
  const [critical, setCritical] = useState<Incident | null>(null);
  const isStaff = user?.role === "ANALYST" || user?.role === "ADMIN";

  useEffect(() => {
    if (!data || !isStaff) return;
    if (seen.current === null) {
      seen.current = new Set(data.map((i) => i.id)); // first load is the baseline
      return;
    }
    const known = seen.current;
    const fresh = data.filter((i) => !known.has(i.id) && i.reporter.id !== user?.id);
    data.forEach((i) => known.add(i.id));
    for (const incident of fresh) toast.info(`New incident #${incident.id}: ${incident.title}`);
    const urgent = fresh.find((i) => i.severity === "CRITICAL");
    if (urgent) setCritical(urgent);
  }, [data, isStaff, user?.id]);

  return { critical, dismiss: () => setCritical(null) };
}
