"use client";

import { useEffect, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Search from "@mui/icons-material/Search";
import { useSession } from "@/hooks/useSession";
import { isStaff } from "@/lib/auth/permissions";

// Ctrl/Cmd+K focuses the box; Enter opens the incident list filtered by the text.
// Reporters have no /incidents page, so theirs searches their own cases.
export function GlobalSearch() {
  const router = useRouter();
  const { user } = useSession();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
        input.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = input.current?.value.trim();
    if (!q) return;
    const base = user && !isStaff(user) ? "/portal/cases" : "/incidents";
    router.push(`${base}?q=${encodeURIComponent(q)}`);
  };

  return (
    <form role="search" onSubmit={onSubmit} className="relative w-full max-w-md">
      <label htmlFor="global-search" className="sr-only">
        Search incidents
      </label>
      <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-lg text-muted">
        <Search fontSize="inherit" />
      </span>
      <input
        id="global-search"
        ref={input}
        type="search"
        placeholder="Search incidents"
        className="h-9 w-full rounded-md border border-border bg-surface pl-10 pr-14 text-sm placeholder:text-muted/70"
      />
      <kbd className="pointer-events-none absolute inset-y-0 right-2 my-auto hidden h-5 items-center rounded border border-border px-1.5 font-mono text-[10px] text-muted sm:flex">
        Ctrl K
      </kbd>
    </form>
  );
}
