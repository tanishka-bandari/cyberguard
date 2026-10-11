"use client";

import { useEffect, useRef } from "react";
import LockOpen from "@mui/icons-material/LockOpen";
import type { Session } from "@/types/domain";

const SHOW_MS = 1900;

// Full-screen "ACCESS GRANTED" pop-up shown after a successful sign-in. It calls onDone once it
// has been on screen long enough; the caller then stores the session, which triggers the redirect.
export function AccessGranted({ session, onDone }: { session: Session; onDone: () => void }) {
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    const id = setTimeout(() => done.current(), SHOW_MS);
    return () => clearTimeout(id);
  }, []);

  return (
    <div role="status" aria-live="assertive" className="ag-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/85 px-4">
      <div className="ag-card relative w-full max-w-md overflow-hidden rounded-xl border border-accent-text/60 bg-black/95 p-8 text-center">
        <div aria-hidden className="mb-5 flex justify-center gap-8">
          <span className="ag-eye" />
          <span className="ag-eye" />
        </div>
        <LockOpen aria-hidden fontSize="inherit" className="mb-2 text-4xl text-accent-text" />
        <h2 className="ag-title font-mono text-3xl font-bold tracking-[0.2em] text-accent-text">ACCESS GRANTED</h2>
        <p className="mt-3 font-mono text-sm text-fg">Welcome back, {session.user.name}</p>
        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-accent-text">clearance: {session.user.role}</p>
        <p className="mt-5 font-mono text-xs italic text-critical-text">...the system has been watching you.</p>
      </div>
    </div>
  );
}
