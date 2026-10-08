"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useNow } from "@/components/dashboard/useNow";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { timeAgo } from "@/lib/format";

// "STATUS_CHANGED" -> "Status changed"
const actionLabel = (action: string) => {
  const text = action.toLowerCase().replaceAll("_", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// The real audit log, newest first.
export function RecentActivity({ limit = 10 }: { limit?: number }) {
  const { data, error, isLoading, mutate } = useRecentActivity(limit);
  const now = useNow();

  if (isLoading) return <div className="space-y-3 p-4"><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" /></div>;
  if (error) return <ErrorState title="Could not load activity" error={error} onRetry={() => void mutate()} />;
  if (!data?.length) return <EmptyState title="No activity yet" description="Actions on incidents appear here as they happen." />;

  return (
    <ul className="divide-y divide-border">
      {data.map((entry) => (
        <li key={entry.id} className="px-4 py-3 text-sm">
          <p className="flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="font-medium">{actionLabel(entry.action)}</span>
            <time dateTime={entry.createdAt.toISOString()} className="text-xs text-muted">
              {timeAgo(entry.createdAt, now)}
            </time>
          </p>
          <p className="mt-0.5 text-muted">{entry.details}</p>
          <p className="mt-0.5 text-xs text-muted">
            {entry.actor.name}
            {entry.incidentId !== null && (
              <>
                {" - "}
                <Link href={`/incidents/${entry.incidentId}`} className="text-accent-text hover:underline">
                  Incident #{entry.incidentId}
                </Link>
              </>
            )}
          </p>
        </li>
      ))}
    </ul>
  );
}
