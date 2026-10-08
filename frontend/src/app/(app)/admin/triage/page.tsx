import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Triage board" };

export default function Page() {
  return <PageHeader title="Triage board" />;
}
