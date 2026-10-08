import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Report an incident" };

export default function Page() {
  return <PageHeader title="Report an incident" />;
}
