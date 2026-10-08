"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { useSWRConfig } from "swr";
import { clearSession, getSession, saveSession, subscribeSession } from "@/lib/auth/session";
import type { Session, User } from "@/types/domain";

type Status = "loading" | "authenticated" | "anonymous";

interface SessionValue {
  status: Status;
  user: User | null;
  token: string | null;
  signIn: (session: Session) => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

// undefined on the server and during hydration, so the first client render matches the server.
const getServerSnapshot = () => undefined;

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { mutate } = useSWRConfig();
  const session = useSyncExternalStore(subscribeSession, getSession, getServerSnapshot);

  const signOut = useCallback(() => {
    clearSession();
    void mutate(() => true, undefined, { revalidate: false });
  }, [mutate]);

  const value = useMemo<SessionValue>(
    () => ({
      status: session === undefined ? "loading" : session ? "authenticated" : "anonymous",
      user: session?.user ?? null,
      token: session?.token ?? null,
      signIn: saveSession,
      signOut,
    }),
    [session, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}
