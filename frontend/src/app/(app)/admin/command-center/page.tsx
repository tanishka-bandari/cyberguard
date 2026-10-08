import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Command center" };

export default function Page() {
  return <PageHeader title="Command center" />;
}
