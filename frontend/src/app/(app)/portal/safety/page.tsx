import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Stay safe" };

export default function Page() {
  return <PageHeader title="Stay safe" />;
}
