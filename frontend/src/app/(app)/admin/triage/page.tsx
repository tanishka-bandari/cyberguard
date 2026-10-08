import type { Metadata } from "next";
import { TriageBoard } from "@/components/admin/TriageBoard";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Triage board" };

export default function Page() {
  return (
    <>
      <PageHeader title="Triage board" description="Move incidents through the workflow and hand them to staff." />
      <TriageBoard />
    </>
  );
}
