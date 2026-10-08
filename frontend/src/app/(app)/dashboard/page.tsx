import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  return <PageHeader title="Dashboard" />;
}
