import type { Metadata } from "next";
import { ReportWizard } from "@/components/portal/ReportWizard";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Report an incident" };

export default function Page() {
  return (
    <>
      <PageHeader title="Report an incident" description="Four short steps. If something feels wrong, it is worth reporting." />
      <ReportWizard />
    </>
  );
}
