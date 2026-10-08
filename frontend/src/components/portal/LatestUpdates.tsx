"use client";

import Link from "next/link";
import { useCaseUpdates } from "@/components/portal/useCaseUpdates";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { timeAgo } from "@/lib/format";

export function LatestUpdates({ incidentIds }: { incidentIds: number[] }) {
  const { data, error, isLoading } = useCaseUpdates(incidentIds);

  let body;
  if (incidentIds.length === 0) body = <p className="text-sm text-muted">Updates on your cases will appear here.</p>;
  else if (isLoading) body = <Skeleton className="h-24" />;
  else if (error) body = <p className="text-sm text-muted">Updates could not be loaded right now.</p>;
  else if (!data?.length) body = <p className="text-sm text-muted">No updates yet. The security team has not changed anything.</p>;
  else {
    body = (
      <ul className="divide-y divide-border">
        {data.map((update) => (
          <li key={update.id} className="flex items-baseline justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0">
            <span>
              <Link href={`/portal/cases/${update.incidentId}`} className="font-mono text-accent-text hover:underline">
                #{update.incidentId}
              </Link>{" "}
              {update.text}
            </span>
            <time dateTime={update.createdAt.toISOString()} className="shrink-0 text-xs text-muted">
              {timeAgo(update.createdAt)}
            </time>
          </li>
        ))}
      </ul>
    );
  }

  return <Card title="Latest updates">{body}</Card>;
}
