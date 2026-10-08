import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Team" };

export default function Page() {
  return <PageHeader title="Team" />;
}
