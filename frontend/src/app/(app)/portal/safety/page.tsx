import type { Metadata } from "next";
import { SafetyTips } from "@/components/portal/SafetyTips";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Stay safe" };

export default function Page() {
  return (
    <>
      <PageHeader title="Stay safe" description="What to do, and what to avoid, for each kind of incident." />
      <SafetyTips />
    </>
  );
}
