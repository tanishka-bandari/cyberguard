import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { setToken, setUnauthorizedHandler, tokenExpired } from "./api";
import Login from "./Login";
import Dashboard from "./Dashboard";
import UserPortal from "./UserPortal";

const SESSION_KEY = "cg.session";

function loadSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (s?.token && !tokenExpired(s.token)) { setToken(s.token); return s; }
  } catch { /* ignore */ }
  return null;
}

export default function App() {
  const [session, setSession] = useState(loadSession);

  const logout = useCallback(() => {
    try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    setToken(null);
    setSession(null);
  }, []);

  /* any 401 from the backend = token expired → back to login */
  useEffect(() => { setUnauthorizedHandler(logout); }, [logout]);

  const login = useCallback((s) => {
    setToken(s.token);
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch { /* ignore */ }
    setSession(s);
  }, []);

  if (!session) return <Login onLogin={login} />;
  if (session.user.role === "USER") return <UserPortal session={session} onLogout={logout} />;
  return <Dashboard session={session} onLogout={logout} />;
}