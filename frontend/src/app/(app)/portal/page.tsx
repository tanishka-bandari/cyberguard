import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Overview" };

export default function Page() {
  return <PageHeader title="Overview" />;
}
