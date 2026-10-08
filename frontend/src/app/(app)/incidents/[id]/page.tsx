import type { Metadata } from "next";
import { IncidentDetail } from "@/components/incidents/IncidentDetail";

export const metadata: Metadata = { title: "Incident detail" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <IncidentDetail id={Number(id)} listHref="/incidents" listLabel="Incidents" />;
}
