import type { Metadata } from "next";
import { UsersTable } from "@/components/admin/UsersTable";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Users" };

export default function Page() {
  return (
    <>
      <PageHeader title="Users" description="Accounts and their roles. Analysts and admins can work incidents." />
      <UsersTable />
    </>
  );
}
