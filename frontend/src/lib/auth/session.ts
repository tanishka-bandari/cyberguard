import type { Session } from "@/types/domain";

// The session lives in localStorage and is exposed as an external store so React
// can read it without a hydration mismatch (see useSession).
const KEY = "cyberguard.session";

let cached: Session | null | undefined;
const listeners = new Set<() => void>();

function tokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function read(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    return session.token && !tokenExpired(session.token) ? session : null;
  } catch {
    return null;
  }
}

function publish(next: Session | null) {
  cached = next;
  listeners.forEach((notify) => notify());
}

export function getSession(): Session | null {
  if (cached === undefined) cached = read();
  return cached;
}

export function saveSession(session: Session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // Storage blocked: the session works until the page is reloaded.
  }
  publish(session);
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing stored if storage is blocked.
  }
  publish(null);
}

export function subscribeSession(notify: () => void) {
  listeners.add(notify);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    cached = undefined; // another tab signed in or out
    notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", onStorage);
  };
}
