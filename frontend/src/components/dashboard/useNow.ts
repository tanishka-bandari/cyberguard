"use client";

import { useEffect, useMemo, useState } from "react";

// A Date that refreshes on an interval, so SLA timers and "x ago" labels stay current.
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

// Local midnight of the current day. The same Date object is returned until the day changes,
// so date-range filtering and day buckets are not recomputed on every clock tick.
export function useToday() {
  const now = useNow();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  return useMemo(() => new Date(year, month, day), [year, month, day]);
}
