import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Incident detail" };

export default function Page() {
  return <PageHeader title="Incident detail" />;
}
