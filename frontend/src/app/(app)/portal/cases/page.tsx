import { Suspense } from "react";
import type { Metadata } from "next";
import { CasesList } from "@/components/portal/CasesList";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = { title: "My cases" };

export default function Page() {
  return (
    <>
      <PageHeader title="My cases" description="Follow every step the security team takes on your reports." />
      <Suspense fallback={<Skeleton className="h-64" />}>
        <CasesList />
      </Suspense>
    </>
  );
}
