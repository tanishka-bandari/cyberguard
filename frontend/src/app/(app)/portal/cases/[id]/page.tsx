import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Case detail" };

export default function Page() {
  return <PageHeader title="Case detail" />;
}
