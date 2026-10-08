import { useEffect, useState } from "react";
import { api, sessionFromLogin } from "./api";
import { I, MatrixRain, HauntLayer } from "./ui";

const MAX_TRIES = 3;
const LOCK_SECONDS = 30;

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | register
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [fails, setFails] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [granted, setGranted] = useState(null); // session waiting for the animation
  const [denied, setDenied] = useState(false);
  const [, tick] = useState(0);

  const lockLeft = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
  useEffect(() => {
    if (!lockLeft) return;
    const t = setInterval(() => tick((n) => n + 1), 500);
    return () => clearInterval(t);
  }, [lockLeft]);

  /* play "ACCESS GRANTED" then enter */
  useEffect(() => {
    if (!granted) return;
    const t = setTimeout(() => onLogin(granted), 1400);
    return () => clearTimeout(t);
  }, [granted, onLogin]);

  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setError(""); };

  const fail = (msg) => {
    const n = fails + 1;
    setFails(n);
    setDenied(true);
    setTimeout(() => setDenied(false), 600);
    if (n >= MAX_TRIES) {
      setLockedUntil(Date.now() + LOCK_SECONDS * 1000);
      setFails(0);
      setError(`Too many failed attempts. Terminal locked for ${LOCK_SECONDS} seconds.`);
    } else {
      setError(`${msg} (${MAX_TRIES - n} attempt${MAX_TRIES - n === 1 ? "" : "s"} left)`);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy || lockLeft) return;
    setError(""); setInfo("");

    if (mode === "register") {
      if (f.name.trim().length < 2) return setError("Please enter your full name.");
      if (f.password.length < 6) return setError("Password must be at least 6 characters.");
      if (f.password !== f.confirm) return setError("Passwords do not match.");
    }

    setBusy(true);
    try {
      if (mode === "register") {
        await api.register(f.name.trim(), f.email.trim(), f.password);
        setInfo("Account created. Logging you in…");
      }
      const r = await api.login(f.email.trim(), f.password);
      if (!r?.token) throw new Error("Login failed: the server did not return a token.");
      setGranted(sessionFromLogin(r));
    } catch (err) {
      if (mode === "login") fail(err.message);
      else setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (m) => { setMode(m); setError(""); setInfo(""); };

  return (
    <div className={`login-screen ${denied ? "denied" : ""} ${granted ? "is-granted" : ""}`}>
      <MatrixRain flicker={denied} />
      <HauntLayer active />

      <div className="login-card">
        <div className="login-brand">
          <div className="brand-logo">{I.shield}</div>
          <div>
            <div className="brand-title">CYBERGUARD</div>
            <div className="brand-sub">Secure Access Terminal</div>
          </div>
        </div>

        <h1 className="login-title glitch hover-glitch" data-text={mode === "login" ? "IDENTIFY YOURSELF" : "REQUEST ACCESS"}>
          {mode === "login" ? "IDENTIFY YOURSELF" : "REQUEST ACCESS"}
        </h1>
        <p className="login-sub">
          {mode === "login" ? "Authorised personnel only. Every attempt is logged." : "Create a reporter account to submit and track incidents."}
        </p>

        <div className="login-tabs">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")}>Login</button>
          <button type="button" className={mode === "register" ? "active" : ""} onClick={() => switchMode("register")}>Register</button>
        </div>

        <form onSubmit={submit} className="login-form">
          {mode === "register" && (
            <label className="login-field">
              {I.user}
              <input value={f.name} onChange={set("name")} placeholder="Full name" autoComplete="name" required />
            </label>
          )}
          <label className="login-field">
            {I.mail}
            <input type="email" value={f.email} onChange={set("email")} placeholder="Email" autoComplete="email" required autoFocus />
          </label>
          <label className="login-field">
            {I.key}
            <input type={show ? "text" : "password"} value={f.password} onChange={set("password")} placeholder="Password"
              autoComplete={mode === "login" ? "current-password" : "new-password"} required />
            <button type="button" className="login-eye" onClick={() => setShow(!show)}>{show ? "HIDE" : "SHOW"}</button>
          </label>
          {mode === "register" && (
            <label className="login-field">
              {I.lock}
              <input type={show ? "text" : "password"} value={f.confirm} onChange={set("confirm")} placeholder="Confirm password" autoComplete="new-password" required />
            </label>
          )}

          {error && <p className="login-msg error">{I.alert}{error}</p>}
          {info && <p className="login-msg ok">{I.check}{info}</p>}

          <button type="submit" className="btn-primary login-submit" disabled={busy || !!lockLeft || !!granted}>
            {lockLeft ? `LOCKED · ${lockLeft}s` : busy ? "AUTHENTICATING…" : mode === "login" ? <>{I.lock}ACCESS SYSTEM</> : <>{I.user}CREATE ACCOUNT</>}
          </button>
        </form>

        <p className="login-foot">
          {mode === "login"
            ? <>New reporter? <a onClick={() => switchMode("register")}>Create an account</a></>
            : <>Analyst and admin accounts are created by an administrator.</>}
        </p>

        <div className="terminal login-terminal">
          <div className="terminal-line typing" key={mode + (error ? "e" : "")}>
            root@cyberguard:~$ {error ? "authentication failure logged" : busy ? "verifying credentials…" : "awaiting credentials"}
            <span className="cursor" />
          </div>
        </div>
      </div>

      {granted && (
        <div className="access-granted">
          <h2 className="glitch" data-text="ACCESS GRANTED">ACCESS GRANTED</h2>
          <p>Welcome, {granted.user.name} · {granted.user.role}</p>
        </div>
      )}
    </div>
  );
}