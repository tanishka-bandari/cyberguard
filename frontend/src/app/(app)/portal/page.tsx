import type { Metadata } from "next";
import { PortalOverview } from "@/components/portal/PortalOverview";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Overview" };

export default function Page() {
  return (
    <>
      <PageHeader title="Overview" description="Your reports and what the security team is doing about them." />
      <PortalOverview />
    </>
  );
}
