/* Shared UI pieces used by Login, Dashboard and UserPortal */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  INCIDENT_TYPES, SEVERITIES, STATUSES, STATUS_LABEL, PROGRESS, GROUP, typeLabel, isOpen,
} from "./api";
import { GHOST_LINES, WHISPERS } from "./data";

/* ================= helpers ================= */
export const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);
export const uid = () => Math.random().toString(36).slice(2, 10);
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const initials = (n = "?") => n.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
export const fmtSize = (b) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);
export const ago = (iso) => {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 45) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
export const fmtDate = (iso) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function usePersisted(key, initial) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage full */ } }, [key, v]);
  return [v, setV];
}

export function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return now;
}

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((text, kind = "info") => {
    const id = uid();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);
  return [toasts, toast];
}

/* ================= icons ================= */
const svg = (d, fill) => (
  <svg viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke={fill ? "none" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
export const I = {
  shield: svg(<path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm-1 14-4-4 1.4-1.4L11 13.2l4.6-4.6L17 10l-6 6Z" />, true),
  grid: svg(<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>),
  users: svg(<><circle cx="9" cy="8" r="4" /><path d="M2 21c0-4 3-6 7-6s7 2 7 6M17 11a3 3 0 1 0 0-6M22 21c0-3-2-5-5-5.5" /></>),
  wrench: svg(<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4 2.5-2.5Z" />),
  list: svg(<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />),
  globe: svg(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>),
  doc: svg(<><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6" /></>),
  clock: svg(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  check: svg(<><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>),
  logout: svg(<path d="M15 3h4v18h-4M10 17l5-5-5-5M15 12H3" />),
  search: svg(<><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>),
  bell: svg(<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0" />),
  alert: svg(<><path d="M12 3 2 21h20L12 3Z" /><path d="M12 10v5M12 18h.01" /></>),
  plus: svg(<path d="M12 5v14M5 12h14" />),
  user: svg(<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>),
  x: svg(<path d="M18 6 6 18M6 6l12 12" />),
  upload: svg(<path d="M12 16V4M7 9l5-5 5 5M4 20h16" />),
  file: svg(<><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></>),
  trash: svg(<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />),
  play: svg(<path d="M7 4v16l13-8Z" />, true),
  mail: svg(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>),
  lock: svg(<><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>),
  key: svg(<><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9M17 6l3 3" /></>),
  refresh: svg(<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5" />),
  bug: svg(<><rect x="7" y="7" width="10" height="13" rx="5" /><path d="M12 7V4M9 4l1.5 3M15 4l-1.5 3M3 12h4M17 12h4M4 7l3 2M20 7l-3 2M4 18l3-2M20 18l-3-2" /></>),
  db: svg(<><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>),
  wave: svg(<path d="M2 12h3l3-8 4 16 4-12 2 4h4" />),
  board: svg(<><rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="12" rx="1" /><rect x="17" y="3" width="4" height="8" rx="1" /></>),
  radar: svg(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><path d="M12 12 19 5" /></>),
  bulb: svg(<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3Z" />),
  eye: svg(<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>),
  skull: svg(<><path d="M12 2a8 8 0 0 0-8 8c0 3 1.5 5 3 6v3h10v-3c1.5-1 3-3 3-6a8 8 0 0 0-8-8Z" /><circle cx="9" cy="10" r="1.6" fill="currentColor" /><circle cx="15" cy="10" r="1.6" fill="currentColor" /><path d="M10 19v2M14 19v2" /></>),
};

/* ================= ambient ================= */
export function MatrixRain({ flicker }) {
  const ref = useRef(null);
  const colorRef = useRef("#00ffc8");
  colorRef.current = flicker ? "#ff2d55" : "#00ffc8";
  useEffect(() => {
    const c = ref.current;
    const ctx = c.getContext("2d");
    const chars = "01アイウエオカキクケコサシスセソ<>/{}#$%☠".split("");
    const size = 16;
    let drops = [];
    const resize = () => {
      c.width = window.innerWidth; c.height = window.innerHeight;
      drops = Array(Math.floor(c.width / size)).fill(0).map(() => Math.random() * -50);
    };
    resize();
    window.addEventListener("resize", resize);
    const id = setInterval(() => {
      ctx.fillStyle = "rgba(3, 11, 15, 0.08)";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = colorRef.current;
      ctx.font = `${size}px monospace`;
      drops.forEach((y, i) => {
        ctx.fillText(pick(chars), i * size, y * size);
        drops[i] = y * size > c.height && Math.random() > 0.975 ? 0 : y + 1;
      });
    }, 60);
    return () => { clearInterval(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="matrix-canvas" />;
}

export function WatchingEye() {
  const ref = useRef(null);
  const [p, setP] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const move = (e) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const a = Math.atan2(dy, dx);
      const d = Math.min(5, Math.hypot(dx, dy) / 40);
      setP({ x: Math.cos(a) * d, y: Math.sin(a) * d });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return (
    <div className="eye" ref={ref} title="It is watching">
      <span className="pupil" style={{ transform: `translate(${p.x}px, ${p.y}px)` }} />
    </div>
  );
}

/* ================= HAUNTED MODE ================= */
const SUBLIMINAL = ["I SEE YOU", "LET ME IN", "BEHIND YOU", "DON'T LOOK BACK", "IT LIVES IN THE NETWORK", "YOU ARE NOT ALONE"];
const SHADOW_SVG = (
  <svg viewBox="0 0 60 200" aria-hidden="true">
    <ellipse cx="30" cy="18" rx="11" ry="14" />
    <path d="M15 38 Q30 30 45 38 L53 118 Q49 124 45 118 L42 200 L34 200 L30 132 L26 200 L18 200 L15 118 Q11 124 7 118 Z" />
  </svg>
);

/* static noise, vignette, a figure that walks behind the panels, and subliminal flashes */
export function HauntLayer({ active }) {
  const noiseRef = useRef(null);
  const [flash, setFlash] = useState(null);
  const [shadow, setShadow] = useState(0);

  useEffect(() => {
    if (!active || !noiseRef.current) return;
    const c = noiseRef.current;
    const ctx = c.getContext("2d");
    c.width = 160; c.height = 90;
    const img = ctx.createImageData(c.width, c.height);
    const id = setInterval(() => {
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    }, 110);
    return () => clearInterval(id);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    let t1, t2;
    const flashLoop = () => {
      t1 = setTimeout(() => {
        setFlash(pick(SUBLIMINAL));
        setTimeout(() => setFlash(null), 140);
        flashLoop();
      }, 35000 + Math.random() * 45000);
    };
    const shadowLoop = () => {
      t2 = setTimeout(() => { setShadow((s) => s + 1); shadowLoop(); }, 25000 + Math.random() * 35000);
    };
    flashLoop();
    shadowLoop();
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [active]);

  if (!active) return null;
  return (
    <>
      <canvas ref={noiseRef} className="haunt-noise" />
      <div className="haunt-vignette" />
      {shadow > 0 && <div key={shadow} className={`haunt-shadow ${shadow % 2 ? "ltr" : "rtl"}`}>{SHADOW_SVG}</div>}
      {flash && <div className="haunt-flash">{flash}</div>}
    </>
  );
}

/* flicker + creepy terminal lines + whispers, shared by every dashboard */
export function useHaunt(haunted, toast, baseTerm) {
  const [flicker, setFlicker] = useState(false);
  const [terminal, setTerminal] = useState(baseTerm);
  useEffect(() => {
    if (!haunted) return;
    let t;
    const loop = () => {
      t = setTimeout(() => {
        setFlicker(true);
        setTimeout(() => setFlicker(false), 450);
        const line = pick(GHOST_LINES);
        setTerminal(line);
        setTimeout(() => setTerminal((c) => (c === line ? baseTerm : c)), 3500);
        if (Math.random() < 0.35) toast(pick(WHISPERS), "ghost");
        loop();
      }, 12000 + Math.random() * 12000);
    };
    loop();
    return () => clearTimeout(t);
  }, [haunted, toast, baseTerm]);
  return { flicker, terminal, setTerminal };
}

/* text that decodes itself from random glyphs */
export function ScrambleText({ text, className = "", as: Tag = "span" }) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    const glyphs = "!<>-_\\/[]{}=+*^?#░▒▓█";
    const total = 18;
    let f = 0;
    const id = setInterval(() => {
      f++;
      setOut(text.split("").map((ch, i) => (ch === " " || i < (f / total) * text.length ? ch : glyphs[Math.floor(Math.random() * glyphs.length)])).join(""));
      if (f >= total) { clearInterval(id); setOut(text); }
    }, 40);
    return () => clearInterval(id);
  }, [text]);
  return <Tag className={className} data-text={text}>{out}</Tag>;
}

/* threat score from open incidents */
const WEIGHT = { critical: 10, high: 5, medium: 2, low: 1 };
export const threatScore = (list) => list.filter(isOpen).reduce((s, i) => s + (WEIGHT[i.severity] || 1), 0);

export function ThreatGauge({ score, label = "Threat level" }) {
  const levels = [[50, "SEVERE", "critical"], [25, "HIGH", "high"], [10, "ELEVATED", "medium"], [0, "LOW", "low"]];
  const [, name, cls] = levels.find(([min]) => score >= min);
  const pct = Math.min(100, (score / 60) * 100);
  return (
    <div className={`gauge gauge-${cls}`}>
      <div className="gauge-arc">
        <div className="gauge-needle" style={{ transform: `rotate(${-90 + pct * 1.8}deg)` }} />
      </div>
      <div className="gauge-read"><b>{name}</b><span>{label} · {score}</span></div>
    </div>
  );
}

/* ================= small UI ================= */
export function Avatar({ p, size = "" }) {
  return (
    <span className={`p-avatar ${size}`} style={{ "--pc": p.color || "#00ffc8" }}>
      {initials(p.name)}
      {p.status && <i className={`presence-dot ${p.status}`} />}
    </span>
  );
}

export function Progress({ value }) {
  return <div className="progress"><span style={{ width: `${value}%` }} /></div>;
}

export function RiskMeter({ value }) {
  const v = Math.max(0, Math.min(100, value));
  const level = v >= 75 ? "critical" : v >= 50 ? "high" : v >= 25 ? "medium" : "low";
  return (
    <div className={`risk risk-${level}`} title={`Risk score ${v}/100`}>
      <div className="risk-bar"><span style={{ width: `${v}%` }} /></div>
      <b>{v}</b>
    </div>
  );
}

export function Overlay({ onClose, children, kind = "modal" }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className={`overlay overlay-${kind}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      {children}
    </div>
  );
}

export function Toasts({ toasts }) {
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`}>
          {t.kind === "ghost" ? I.skull : t.kind === "ok" ? I.check : t.kind === "error" ? I.alert : I.bell}
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

export function StatusStepper({ status, onPick, disabled }) {
  const idx = STATUSES.indexOf(status);
  return (
    <ol className="stepper">
      {STATUSES.map((s, k) => (
        <li key={s} className={`step ${k < idx ? "done" : ""} ${k === idx ? "current" : ""}`}>
          <button type="button" disabled={disabled || k === idx} onClick={() => onPick?.(s)} title={disabled ? STATUS_LABEL[s] : `Set to ${STATUS_LABEL[s]}`}>
            <span className="step-dot" />
            <span className="step-label">{STATUS_LABEL[s]}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}

/* ================= report form ================= */
export function ReportForm({ onSubmit, onCancel, compact }) {
  const empty = { title: "", description: "", type: "PHISHING", severity: "medium", riskScore: 50 };
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const valid = f.title.trim() && f.description.trim();

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    const ok = await onSubmit({ ...f, title: f.title.trim(), description: f.description.trim(), severity: f.severity.toUpperCase(), riskScore: Number(f.riskScore) });
    setBusy(false);
    if (ok) setF(empty);
  };

  return (
    <form className={`report-form ${compact ? "compact" : ""}`} onSubmit={submit}>
      <div className="form-grid">
        <div className="field span-2"><label>Title *</label><input className="input" value={f.title} onChange={set("title")} placeholder="e.g. Suspicious login on VPN" maxLength={200} /></div>
        <div className="field"><label>Type</label>
          <select className="select" value={f.type} onChange={set("type")}>{INCIDENT_TYPES.map((t) => <option key={t} value={t}>{typeLabel(t)}</option>)}</select>
        </div>
        <div className="field"><label>Severity</label>
          <select className="select" value={f.severity} onChange={set("severity")}>{SEVERITIES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}</select>
        </div>
        <div className="field span-2"><label>Risk score: <b className="risk-num">{f.riskScore}</b> / 100</label>
          <input type="range" min="0" max="100" value={f.riskScore} onChange={set("riskScore")} className={`range range-${f.riskScore >= 75 ? "critical" : f.riskScore >= 50 ? "high" : f.riskScore >= 25 ? "medium" : "low"}`} />
        </div>
        <div className="field span-2"><label>Description *</label><textarea className="textarea" rows="4" value={f.description} onChange={set("description")} placeholder="What happened? Which systems or accounts are affected?" maxLength={2000} /></div>
      </div>
      <div className="btn-row end">
        {onCancel && <button type="button" className="btn" onClick={onCancel}>Cancel</button>}
        <button type="submit" className="btn btn-primary-sm" disabled={!valid || busy}>{I.alert}{busy ? "Sending…" : "Submit Report"}</button>
      </div>
    </form>
  );
}

/* ================= incident popup ================= */
/*
  can = { status, assign, del, notes }
  extras = locally-saved { notes, evidence } for this incident
  timeline = array of { id, at, text }
*/
export function IncidentModal({ incident: i, extras = {}, timeline, staff = [], can, actions, onClose, onOpenPerson, workload }) {
  const [note, setNote] = useState("");
  const [drag, setDrag] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const fileRef = useRef(null);
  const notes = extras.notes || [];
  const evidence = extras.evidence || [];

  const readFiles = (files) =>
    Promise.all([...files].map((f) => new Promise((res) => {
      const base = { id: uid(), name: f.name, size: f.size, type: f.type, at: new Date().toISOString() };
      if (f.type.startsWith("image/") && f.size < 800000) {
        const r = new FileReader();
        r.onload = () => res({ ...base, url: r.result });
        r.readAsDataURL(f);
      } else res(base);
    }))).then((items) => actions.addEvidence(i.id, items));

  const submitNote = () => { if (note.trim()) { actions.note(i.id, note.trim()); setNote(""); } };
  const solved = GROUP[i.status] === "solved";

  return (
    <Overlay onClose={onClose}>
      <div className={`modal modal-wide sev-${i.severity}`}>
        <header className="modal-head">
          <div>
            <p className="eyebrow">Incident #{i.id} · {typeLabel(i.type)}</p>
            <h2 className="modal-title">{i.title}</h2>
            <div className="badge-row">
              <span className={`badge badge-${i.severity}`}>{i.severity}</span>
              <span className={`status-pill status-${GROUP[i.status]}`}>{STATUS_LABEL[i.status]}</span>
              <span className="muted">Reported {ago(i.reportedAt)} by {i.reporter.name}</span>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">{I.x}</button>
        </header>

        <section className="stepper-wrap">
          <StatusStepper status={i.status} disabled={!can.status} onPick={(s) => actions.status(i.id, s)} />
        </section>

        <div className="modal-grid">
          <div className="modal-main">
            <section>
              <h4 className="section-title">Description</h4>
              <p className="desc">{i.description || "No description provided."}</p>
            </section>

            <section className="info-grid">
              <div><dt>Reported by</dt><dd>{i.reporter.name}{i.reporter.email && <small className="muted block">{i.reporter.email}</small>}</dd></div>
              <div><dt>Reported at</dt><dd>{fmtDate(i.reportedAt)}</dd></div>
              <div><dt>Type</dt><dd>{typeLabel(i.type)}</dd></div>
              <div><dt>Risk score</dt><dd><RiskMeter value={i.riskScore} /></dd></div>
            </section>

            <section>
              <h4 className="section-title">Work progress <span className="muted">{PROGRESS[i.status]}%</span></h4>
              <Progress value={PROGRESS[i.status]} />
              {i.assignee && GROUP[i.status] === "progress" && (
                <p className="working-now"><span className="live-dot" />{i.assignee.name} is working on this · {STATUS_LABEL[i.status]}</p>
              )}
            </section>

            {can.notes && (
              <>
                <section>
                  <h4 className="section-title">Notes ({notes.length}) <span className="muted">saved on this device</span></h4>
                  <div className="note-input">
                    <textarea className="textarea" rows="3" placeholder="Add an investigation note… (Ctrl+Enter to save)"
                      value={note} onChange={(e) => setNote(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.ctrlKey || e.metaKey) && submitNote()} />
                    <button className="btn btn-primary-sm" onClick={submitNote} disabled={!note.trim()}>{I.plus}Add Note</button>
                  </div>
                  <ul className="notes">
                    {notes.map((n) => (
                      <li key={n.id} className="note">
                        <div className="note-head"><b>{n.author}</b><span className="muted">{ago(n.at)}</span></div>
                        <p>{n.text}</p>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h4 className="section-title">Evidence ({evidence.length}) <span className="muted">saved on this device</span></h4>
                  <div className={`dropzone ${drag ? "drag" : ""}`}
                    onClick={() => fileRef.current.click()}
                    onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={(e) => { e.preventDefault(); setDrag(false); readFiles(e.dataTransfer.files); }}>
                    {I.upload}
                    <span>Drop screenshots, logs or PCAPs here, or <u>browse</u></span>
                    <input ref={fileRef} type="file" multiple hidden onChange={(e) => { readFiles(e.target.files); e.target.value = ""; }} />
                  </div>
                  {!!evidence.length && (
                    <div className="evidence-grid">
                      {evidence.map((ev) => (
                        <div key={ev.id} className="evidence">
                          {ev.url ? <a href={ev.url} target="_blank" rel="noreferrer"><img src={ev.url} alt={ev.name} /></a> : <div className="evidence-file">{I.file}</div>}
                          <div className="evidence-meta"><span title={ev.name}>{ev.name}</span><small>{fmtSize(ev.size)} · {ago(ev.at)}</small></div>
                          <button className="evidence-remove" onClick={() => actions.removeEvidence(i.id, ev.id)} title="Remove">{I.trash}</button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>

          <aside className="modal-side">
            {can.status && (
              <div className="field">
                <label>Status</label>
                <select className="select" value={i.status} onChange={(e) => actions.status(i.id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>
            )}

            {can.assign ? (
              <div className="field">
                <label>Assign to</label>
                <select className="select" value={i.assigneeId ?? ""} onChange={(e) => actions.assign(i.id, e.target.value ? Number(e.target.value) : null)}>
                  <option value="">— Unassigned —</option>
                  {["ANALYST", "WORKER", "ADMIN"].map((r) => {
                    const people = staff.filter((p) => p.role === r);
                    return people.length ? (
                      <optgroup key={r} label={`${cap(r.toLowerCase())}s`}>
                        {people.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} · {workload ? workload(p.id) : 0} active</option>
                        ))}
                      </optgroup>
                    ) : null;
                  })}
                </select>
              </div>
            ) : (
              <div className="field"><label>Assigned to</label><p className="muted">{i.assignee ? "" : "Not assigned yet"}</p></div>
            )}

            {i.assignee && (
              <button className="assignee-card" onClick={() => onOpenPerson?.(i.assignee.id)} disabled={!onOpenPerson}>
                <Avatar p={{ ...i.assignee, color: staff.find((s) => s.id === i.assignee.id)?.color }} />
                <div><b>{i.assignee.name}</b><small>{i.assignee.email}</small></div>
              </button>
            )}

            {can.status && (
              <div className="btn-row">
                {!solved && i.status !== "UNDER_INVESTIGATION" && i.status !== "CONTAINED" && (
                  <button className="btn" onClick={() => actions.status(i.id, "UNDER_INVESTIGATION")}>{I.play}Investigate</button>
                )}
                {i.status === "UNDER_INVESTIGATION" && <button className="btn" onClick={() => actions.status(i.id, "CONTAINED")}>{I.lock}Contain</button>}
                {!solved
                  ? <button className="btn btn-ok" onClick={() => actions.status(i.id, "RESOLVED")}>{I.check}Resolve</button>
                  : i.status === "RESOLVED"
                    ? <button className="btn btn-ok" onClick={() => actions.status(i.id, "CLOSED")}>{I.check}Close</button>
                    : <button className="btn btn-danger" onClick={() => actions.status(i.id, "REPORTED")}>{I.alert}Reopen</button>}
              </div>
            )}

            {can.del && (
              confirmDel ? (
                <div className="btn-row">
                  <button className="btn" onClick={() => setConfirmDel(false)}>Cancel</button>
                  <button className="btn btn-danger" onClick={() => actions.remove(i.id)}>{I.trash}Delete forever</button>
                </div>
              ) : <button className="btn btn-danger ghosted" onClick={() => setConfirmDel(true)}>{I.trash}Delete incident</button>
            )}

            <h4 className="section-title">Timeline</h4>
            <ul className="timeline">
              {timeline.map((t) => (
                <li key={t.id} className="tl-item">
                  <span className="tl-dot" />
                  <div>{t.text}<small>{fmtDate(t.at)}</small></div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </Overlay>
  );
}