import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "My cases" };

export default function Page() {
  return <PageHeader title="My cases" />;
}
