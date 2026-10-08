import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Users" };

export default function Page() {
  return <PageHeader title="Users" />;
}
