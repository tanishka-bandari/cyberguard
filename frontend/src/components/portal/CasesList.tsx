"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CaseCard } from "@/components/portal/CaseCard";
import { Button, buttonClass } from "@/components/ui/Button";
import { Chips } from "@/components/ui/Chips";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useIncidents } from "@/hooks/useIncidents";
import { useReplaceParams } from "@/hooks/useReplaceParams";
import { EMPTY_FILTERS, filterIncidents } from "@/lib/domain/filters";
import { isOpen } from "@/lib/domain/incident";

type CaseFilter = "open" | "resolved";

const parseFilter = (value: string | null): CaseFilter | null =>
  value === "open" || value === "resolved" ? value : null;

export function CasesList() {
  const replaceParams = useReplaceParams();
  const params = useSearchParams();
  const { data, error, isLoading, mutate } = useIncidents();

  const filter = parseFilter(params.get("filter"));
  const query = params.get("q") ?? "";

  const setParam = (key: "filter" | "q", value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    replaceParams(next);
  };

  if (isLoading || (!data && !error)) return <Skeleton className="h-64" />;
  if (error || !data) return <ErrorState error={error} onRetry={() => void mutate()} />;

  const openCount = data.filter(isOpen).length;
  const matching = filterIncidents(data, { ...EMPTY_FILTERS, q: query });
  const shown = matching
    .filter((incident) => !filter || isOpen(incident) === (filter === "open"))
    .sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());

  const reportLink = (
    <Link href="/portal/report" className={buttonClass("primary")}>
      Report an incident
    </Link>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Chips<CaseFilter>
          label="Filter cases"
          value={filter}
          onChange={(value) => setParam("filter", value)}
          allLabel={`All (${data.length})`}
          options={[
            { value: "open", label: `Open (${openCount})` },
            { value: "resolved", label: `Resolved (${data.length - openCount})` },
          ]}
        />
        {query && (
          <p className="flex items-center gap-2 text-sm text-muted">
            Matching &ldquo;{query}&rdquo;
            <Button size="sm" variant="ghost" onClick={() => setParam("q", null)}>
              Clear search
            </Button>
          </p>
        )}
      </div>

      {shown.length > 0 ? (
        <div className="space-y-3">
          {shown.map((incident) => (
            <CaseCard key={incident.id} incident={incident} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-panel">
          {data.length === 0 ? (
            <EmptyState
              title="You have not reported anything yet"
              description="If something looks suspicious, report it and follow its progress here."
              action={reportLink}
            />
          ) : (
            <EmptyState
              title="No cases match"
              description="Try another filter or clear the search."
              action={reportLink}
            />
          )}
        </div>
      )}
    </div>
  );
}
