"use client";

import { useEffect, useState } from "react";

// A Date that refreshes on an interval, so SLA timers and "x ago" labels stay current.
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}
