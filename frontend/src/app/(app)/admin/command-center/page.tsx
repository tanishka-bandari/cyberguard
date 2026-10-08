import type { Metadata } from "next";
import { CommandCenterView } from "@/components/dashboard/CommandCenterView";

export const metadata: Metadata = { title: "Command center" };

export default function Page() {
  return <CommandCenterView />;
}
