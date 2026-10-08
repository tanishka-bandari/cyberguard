"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Add from "@mui/icons-material/Add";
import { IncidentFilterBar } from "@/components/incidents/IncidentFilterBar";
import { IncidentTable } from "@/components/incidents/IncidentTable";
import { ReportForm } from "@/components/incidents/ReportForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useIncidentFilters } from "@/hooks/useIncidentFilters";
import { useIncidents } from "@/hooks/useIncidents";
import { useSession } from "@/hooks/useSession";
import { can } from "@/lib/auth/permissions";
import { filterIncidents } from "@/lib/domain/filters";
import type { Incident } from "@/types/domain";

const detailHref = (incident: Incident) => `/incidents/${incident.id}`;

export function IncidentList() {
  const router = useRouter();
  const { user } = useSession();
  const { data, error, isLoading, mutate } = useIncidents();
  const { filters, setFilters, clear, isFiltered } = useIncidentFilters();
  const [reporting, setReporting] = useState(false);

  const all = data ?? [];
  const shown = filterIncidents(all, filters);

  const reportButton = can(user, "incident:create") && (
    <Button variant="primary" onClick={() => setReporting(true)}>
      <Add fontSize="inherit" />
      Report incident
    </Button>
  );

  return (
    <>
      <PageHeader title="Incidents" description="Search, filter and open any reported incident." actions={reportButton} />
      <IncidentFilterBar
        filters={filters}
        onChange={setFilters}
        onClear={clear}
        isFiltered={isFiltered}
        shown={shown.length}
        total={all.length}
      />
      <Card flush>
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : error && !data ? (
          <ErrorState title="Could not load incidents" error={error} onRetry={() => mutate()} />
        ) : (
          <IncidentTable
            incidents={shown}
            hrefFor={detailHref}
            onRowClick={(incident) => router.push(detailHref(incident))}
            pageSize={15}
            empty={
              <EmptyState
                title={isFiltered ? "No incidents match these filters" : "No incidents yet"}
                description={isFiltered ? "Try a different search or clear the filters." : "Reported incidents will appear here."}
                action={isFiltered ? <Button onClick={clear}>Clear filters</Button> : undefined}
              />
            }
          />
        )}
      </Card>
      <Dialog open={reporting} onClose={() => setReporting(false)} title="Report an incident">
        {reporting && (
          <ReportForm
            onCancel={() => setReporting(false)}
            onCreated={(incident) => router.push(detailHref(incident))}
          />
        )}
      </Dialog>
    </>
  );
}
