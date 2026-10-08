"use client";

import { useIncidents } from "@/hooks/useIncidents";

// The API has no "get one" endpoint, so this picks the incident out of the shared list.
export function useIncident(id: number) {
  const { data, error, isLoading, mutate } = useIncidents();
  const incident = data?.find((item) => item.id === id);
  return { incident, error, isLoading, mutate, notFound: !!data && !incident };
}
