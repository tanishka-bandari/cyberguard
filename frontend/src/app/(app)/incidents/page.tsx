import { Suspense } from "react";
import type { Metadata } from "next";
import { IncidentList } from "@/components/incidents/IncidentList";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = { title: "Incidents" };

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <IncidentList />
    </Suspense>
  );
}
