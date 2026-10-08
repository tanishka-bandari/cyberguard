/* What ADMIN and ANALYST see — connected to the Spring Boot backend */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  api, normIncident, normUser, SEVERITIES, STATUS_LABEL, PROGRESS, GROUP, GROUP_LABEL, isOpen, typeLabel,
} from "./api";
import { GHOST_LINES } from "./data";
import {
  I, cap, uid, pick, ago, usePersisted, useNow, useToasts, useHaunt,
  MatrixRain, WatchingEye, HauntLayer, ScrambleText, Avatar, Progress, RiskMeter, Overlay, Toasts, IncidentModal, ReportForm,
} from "./ui";
import { CommandCenter, TriageBoard } from "./AdminViews";

const BASE_TERM = "monitoring network traffic...";
const ROLE_LABEL = { ADMIN: "Administrator", ANALYST: "Security Analyst", WORKER: "Field Worker", USER: "Reporter" };

/* ================= helpers ================= */
function workOf(pid, incidents) {
  const mine = incidents.filter((i) => i.assigneeId === pid);
  const active = mine.filter(isOpen);
  const current = active.find((i) => GROUP[i.status] === "progress") || active[0] || null;
  const solved = mine.length - active.length;
  return { mine, active, current, solved, perf: mine.length ? Math.round((solved / mine.length) * 100) : 0 };
}

function IncidentTable({ rows, onOpen, compact }) {
  return (
    <div className="table-wrap">
      <table className="incident-table clickable">
        <thead>
          <tr>
            <th>ID</th><th>Title</th><th>Type</th><th>Severity</th><th>Status</th>
            {!compact && <><th>Risk</th><th>Reported By</th><th>Assigned To</th><th>Progress</th><th>Reported</th></>}
          </tr>
        </thead>
        <tbody>
          {rows.map((i) => (
            <tr key={i.id} onClick={() => onOpen(i.id)} className={i.severity === "critical" && isOpen(i) ? "row-critical" : ""}>
              <td>#{i.id}</td>
              <td>{i.title}</td>
              <td>{typeLabel(i.type)}</td>
              <td><span className={`badge badge-${i.severity}`}>{i.severity}</span></td>
              <td className={`status-${GROUP[i.status]}`}>{STATUS_LABEL[i.status]}</td>
              {!compact && (
                <>
                  <td style={{ minWidth: 90 }}><RiskMeter value={i.riskScore} /></td>
                  <td>{i.reporter.name}</td>
                  <td>{i.assignee ? <span className="assignee-cell"><Avatar p={i.assignee} size="xs" />{i.assignee.name}</span> : <span className="unassigned">Unassigned</span>}</td>
                  <td style={{ minWidth: 90 }}><Progress value={PROGRESS[i.status]} /></td>
                  <td className="muted">{ago(i.reportedAt)}</td>
                </>
              )}
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={compact ? 5 : 10} className="empty">No incidents match. The network is quiet… too quiet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

/* ================= person drawer ================= */
function PersonDrawer({ person: p, incidents, extras, canAssign, actions, onSetStatus, onClose, onOpenIncident }) {
  const w = workOf(p.id, incidents);
  const [toAssign, setToAssign] = useState("");
  const open = incidents.filter((i) => isOpen(i) && i.assigneeId !== p.id);
  const activity = Object.entries(extras)
    .flatMap(([ref, e]) => (e.timeline || []).filter((t) => t.who === p.id).map((t) => ({ ...t, ref })))
    .sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 12);

  return (
    <Overlay onClose={onClose} kind="drawer">
      <aside className="drawer">
        <header className="drawer-head">
          <Avatar p={p} size="lg" />
          <div className="drawer-id">
            <p className="eyebrow">{ROLE_LABEL[p.role] || p.role} · ID {p.id}</p>
            <h2 className="modal-title">{p.name}</h2>
            <p className="muted">{p.email}</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">{I.x}</button>
        </header>

        <div className="drawer-body">
          <div className="presence-switch">
            {["online", "away", "offline"].map((s) => (
              <button key={s} className={`chip ${p.status === s ? "active" : ""}`} onClick={() => onSetStatus(p.id, s)}>
                <i className={`presence-dot static ${s}`} />{cap(s)}
              </button>
            ))}
          </div>

          <div className="mini-stats">
            <div><b>{w.active.length}</b><span>Active</span></div>
            <div><b>{w.active.filter((i) => GROUP[i.status] === "progress").length}</b><span>Working</span></div>
            <div><b>{w.solved}</b><span>Solved</span></div>
            <div><b>{w.perf}%</b><span>Resolution</span></div>
          </div>

          <section>
            <h4 className="section-title">Live status</h4>
            {p.status === "offline" ? <p className="muted">Offline</p>
              : w.current ? (
                <button className="work-item" onClick={() => onOpenIncident(w.current.id)}>
                  <span className="live-dot" />
                  <div><b>{STATUS_LABEL[w.current.status]} · #{w.current.id}</b> {w.current.title}<Progress value={PROGRESS[w.current.status]} /></div>
                </button>
              ) : <p className="muted">Available, waiting for an assignment</p>}
          </section>

          <section>
            <h4 className="section-title">Assigned incidents ({w.mine.length})</h4>
            <ul className="assigned-list">
              {w.mine.map((i) => (
                <li key={i.id} onClick={() => onOpenIncident(i.id)}>
                  <span className={`badge badge-${i.severity}`}>{i.severity}</span>
                  <span className="grow">#{i.id} {i.title}</span>
                  <span className={`status-${GROUP[i.status]}`}>{STATUS_LABEL[i.status]}</span>
                </li>
              ))}
              {!w.mine.length && <li className="muted">Nothing assigned yet</li>}
            </ul>
            {canAssign && (
              <div className="assign-inline">
                <select className="select" value={toAssign} onChange={(e) => setToAssign(e.target.value)}>
                  <option value="">Assign an open incident…</option>
                  {open.map((i) => <option key={i.id} value={i.id}>#{i.id} {i.title} ({i.severity})</option>)}
                </select>
                <button className="btn btn-primary-sm" disabled={!toAssign} onClick={() => { actions.assign(Number(toAssign), p.id); setToAssign(""); }}>Assign</button>
              </div>
            )}
          </section>

          <section className="info-grid">
            <div><dt>{I.mail}Email</dt><dd>{p.email}</dd></div>
            <div><dt>{I.user}Role</dt><dd>{ROLE_LABEL[p.role] || p.role}</dd></div>
          </section>

          <section>
            <h4 className="section-title">Activity on this device</h4>
            <ul className="timeline">
              {activity.map((t) => (
                <li key={t.id} className="tl-item">
                  <span className="tl-dot" />
                  <div>{t.text} on <a className="panel-link" onClick={() => onOpenIncident(Number(t.ref))}>#{t.ref}</a><small>{ago(t.at)}</small></div>
                </li>
              ))}
              {!activity.length && <li className="muted">No recorded activity yet.</li>}
            </ul>
          </section>
        </div>
      </aside>
    </Overlay>
  );
}

/* ================= people page ================= */
function PeopleView({ roles, people, incidents, query, onOpen, emptyHint }) {
  const list = people.filter((p) => roles.includes(p.role) && (!query || `${p.name} ${p.email} ${p.role}`.toLowerCase().includes(query.toLowerCase())));
  const rows = list.map((p) => ({ p, ...workOf(p.id, incidents) }));
  const max = Math.max(1, ...rows.map((r) => r.active.length));
  const summary = {
    working: rows.filter((r) => r.p.status !== "offline" && r.current && GROUP[r.current.status] === "progress").length,
    available: rows.filter((r) => r.p.status !== "offline" && !r.active.length).length,
    away: rows.filter((r) => r.p.status === "away").length,
    offline: rows.filter((r) => r.p.status === "offline").length,
  };

  if (!rows.length) return <section className="panel"><p className="empty">{emptyHint || "No one found."}</p></section>;

  return (
    <>
      <section className="people-summary">
        <div className="summary-card"><span className="live-dot" /><b>{summary.working}</b> Working now</div>
        <div className="summary-card"><i className="presence-dot static online" /><b>{summary.available}</b> Available</div>
        <div className="summary-card"><i className="presence-dot static away" /><b>{summary.away}</b> Away</div>
        <div className="summary-card"><i className="presence-dot static offline" /><b>{summary.offline}</b> Offline</div>
      </section>

      <section className="panel">
        <div className="panel-head"><h3 className="panel-title">Live Workload</h3><span className="muted">open incidents per person</span></div>
        <div className="workload">
          {rows.map(({ p, active, current }) => (
            <div key={p.id} className="wl-row" onClick={() => onOpen(p.id)}>
              <span className="wl-name"><Avatar p={p} size="xs" />{p.name}</span>
              <div className="wl-bar"><span style={{ width: `${(active.length / max) * 100}%`, background: p.color }} /></div>
              <span className="wl-val">{active.length}</span>
              <span className="wl-task muted">{p.status === "offline" ? "offline" : current ? `#${current.id} · ${STATUS_LABEL[current.status]}` : "idle"}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="people-grid">
        {rows.map(({ p, active, current, solved, perf }) => (
          <article key={p.id} className={`person-card ${p.status}`} style={{ "--pc": p.color }} onClick={() => onOpen(p.id)}>
            <div className="person-top">
              <Avatar p={p} />
              <div className="grow">
                <div className="person-name">{p.name}</div>
                <div className="person-role">{ROLE_LABEL[p.role] || p.role}</div>
              </div>
              <span className={`presence ${p.status}`}>{p.status}</span>
            </div>
            <div className="person-work">
              {p.status === "offline" ? <span className="muted">Offline</span>
                : current ? <><span className="live-dot" />{STATUS_LABEL[current.status]} <b>#{current.id}</b> {current.title}</>
                : <span className="muted">Available for assignment</span>}
            </div>
            <Progress value={current ? PROGRESS[current.status] : 0} />
            <div className="person-meta">
              <span><b>{active.length}</b> active</span>
              <span><b>{solved}</b> solved</span>
              <span><b>{perf}%</b> rate</span>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

/* ================= live network (visual simulation) ================= */
const NODES = [
  { x: 18, y: 35, k: "" }, { x: 25, y: 55, k: "" }, { x: 32, y: 75, k: "suspicious" },
  { x: 48, y: 30, k: "" }, { x: 52, y: 45, k: "malicious" }, { x: 60, y: 60, k: "" },
  { x: 70, y: 35, k: "" }, { x: 78, y: 50, k: "suspicious" }, { x: 85, y: 72, k: "" },
];
const LINKS = [
  { x: 18, y: 35, w: 32, r: -5 }, { x: 25, y: 55, w: 30, r: -18 }, { x: 52, y: 45, w: 20, r: -15, d: true },
  { x: 60, y: 60, w: 22, r: -10 }, { x: 32, y: 75, w: 30, r: -28, d: true }, { x: 48, y: 30, w: 24, r: 5 },
];
const LOG_POOL = [
  ["info", "Connection established 192.168.1.45 → 10.0.0.12"],
  ["warn", "Suspicious pattern detected (outbound burst)"],
  ["info", "Packet analysis complete"],
  ["info", "Scanning port 8080 … no threat found"],
  ["error", "Blocked malicious IP 185.220.101.7"],
  ["info", "Monitoring continues…"],
];

function NetworkPanels({ haunted }) {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    const add = () => {
      const ghost = haunted && Math.random() < 0.12;
      const [level, msg] = ghost ? ["error", pick(GHOST_LINES)] : pick(LOG_POOL);
      setLogs((l) => [{ id: uid(), level, msg, ghost, time: new Date().toLocaleTimeString("en-GB") }, ...l].slice(0, 10));
    };
    add();
    const t = setInterval(add, 2000);
    return () => clearInterval(t);
  }, [haunted]);

  return (
    <section className="grid-two">
      <section className="panel panel-enter">
        <div className="panel-head"><h3 className="panel-title">Live Network Map</h3><span className="muted">simulated view</span></div>
        <div className="network-map">
          {LINKS.map((l, i) => (
            <div key={i} className={`map-link ${l.d ? "danger" : ""}`} style={{ left: `${l.x}%`, top: `${l.y}%`, width: `${l.w}%`, transform: `rotate(${l.r}deg)` }} />
          ))}
          {NODES.map((n, i) => <span key={i} className={`map-node ${n.k}`} style={{ left: `${n.x}%`, top: `${n.y}%` }} />)}
          <div className="packet-tooltip" style={{ left: "58%", top: "8%" }}>
            <strong>Incoming Packet</strong>192.168.1.45 → 10.0.0.12<br />Port: 443 | TLS
          </div>
        </div>
        <div className="map-legend">
          <span><i className="dot dot-low" />Normal</span>
          <span><i className="dot dot-medium" />Suspicious</span>
          <span><i className="dot dot-critical" />Malicious</span>
        </div>
      </section>
      <section className="panel panel-enter">
        <div className="panel-head"><h3 className="panel-title">Network Activity Log</h3></div>
        <ul className="log">
          {logs.map((l) => (
            <li key={l.id} className={`log-entry ${l.ghost ? "ghost" : ""}`}>
              <span className="log-time">[{l.time}]</span>
              <span className={`log-level ${l.level}`}>{l.ghost ? "????" : l.level.toUpperCase()}</span>
              <span className="log-msg">{l.msg}</span>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}

/* ================= DASHBOARD ================= */
const VIEW_TITLES = {
  command: ["Admin · Command Center", "Command Center", "Threat level, SLA breaches and how your team is holding up"],
  triage: ["Admin · Triage", "Triage Board", "Drag incidents between columns to change status. Drop one on a person to assign it"],
  dashboard: ["Security Operations", "Security Dashboard", "Monitor and manage cybersecurity incidents"],
  incidents: ["Incident Management", "All Incidents", "Click any incident to update its status, add notes and evidence, or assign it"],
  employees: ["People", "Employees", "Analysts and admins, their live status and workload"],
  workers: ["People", "Workers", "Field and IT technicians"],
  network: ["Threat Monitoring", "Live Network", "Real-time packet flow and activity log"],
};

export default function Dashboard({ session, onLogout }) {
  const me = session.user;
  const isAdmin = me.role === "ADMIN";
  const can = { status: true, assign: isAdmin, del: isAdmin, notes: true };

  const now = useNow();
  const [incidents, setIncidents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [extras, setExtras] = usePersisted("cg.extras.v3", {});
  const [presence, setPresence] = usePersisted("cg.presence.v3", {});
  const [haunted, setHaunted] = usePersisted("cg.haunted", true);
  const [view, setView] = useState(isAdmin ? "command" : "dashboard");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [openIncidentId, setOpenIncidentId] = useState(null);
  const [openPersonId, setOpenPersonId] = useState(null);
  const [reporting, setReporting] = useState(false);
  const [alert, setAlert] = useState(false);
  const [bannerHiding, setBannerHiding] = useState(false);
  const [toasts, toast] = useToasts();
  const { flicker, terminal, setTerminal } = useHaunt(haunted, toast, BASE_TERM);
  const searchRef = useRef(null);
  const seen = useRef(null);

  const people = useMemo(() => staff.map((p) => ({ ...p, status: presence[p.id] || "online" })), [staff, presence]);
  const byId = useMemo(() => Object.fromEntries(people.map((p) => [p.id, p])), [people]);
  const openIncident = incidents.find((i) => i.id === openIncidentId);
  const openPerson = byId[openPersonId];

  /* ---------- alert ---------- */
  const raiseAlert = useCallback((id) => {
    setTerminal(`ALERT: critical incident #${id} — possible intrusion`);
    setAlert(true);
    setBannerHiding(false);
    setTimeout(() => setBannerHiding(true), 2600);
    setTimeout(() => { setAlert(false); setTerminal(BASE_TERM); }, 3000);
  }, [setTerminal]);

  /* ---------- load from backend (and poll every 20s) ---------- */
  const load = useCallback(async (quiet) => {
    try {
      const [inc, st] = await Promise.all([api.incidents(), api.staff().catch(() => [])]);
      const list = inc.map(normIncident).sort((a, b) => b.id - a.id);
      if (seen.current) {
        const fresh = list.filter((i) => !seen.current.has(i.id));
        const crit = fresh.find((i) => i.severity === "critical");
        if (crit) raiseAlert(crit.id);
        else if (fresh.length) toast(`${fresh.length} new incident(s) reported`, "info");
      }
      seen.current = new Set(list.map((i) => i.id));
      setIncidents(list);
      setStaff(st.map(normUser));
      setLoadError("");
    } catch (e) {
      if (!quiet) setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  }, [raiseAlert, toast]);

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 20000);
    return () => clearInterval(t);
  }, [load]);

  /* ---------- actions ---------- */
  const entry = (text, who) => ({ id: uid(), at: new Date().toISOString(), text, who, by: me.name });
  const patchExtras = (id, fn) => setExtras((x) => ({ ...x, [id]: fn(x[id] || {}) }));
  const addLog = (id, text, who) => patchExtras(id, (e) => ({ ...e, timeline: [entry(text, who), ...(e.timeline || [])] }));
  const replace = (dto) => { const n = normIncident(dto); setIncidents((l) => l.map((i) => (i.id === n.id ? n : i))); return n; };
  const run = async (fn, okMsg) => {
    try { const r = await fn(); if (okMsg) toast(okMsg, "ok"); return r ?? true; }
    catch (e) { toast(e.message, "error"); return null; }
  };

  const actions = {
    status: async (id, status) => {
      const inc = incidents.find((x) => x.id === id);
      const r = await run(async () => replace(await api.setStatus(id, status)), `#${id} → ${STATUS_LABEL[status]}`);
      if (r) addLog(id, `Status changed to ${STATUS_LABEL[status]} by ${me.name}`, inc?.assigneeId);
    },
    assign: async (id, pid) => {
      const p = byId[pid];
      const r = await run(async () => replace(await (pid ? api.assign(id, pid) : api.unassign(id))),
        pid ? `#${id} assigned to ${p?.name}` : `#${id} unassigned`);
      if (r) addLog(id, pid ? `Assigned to ${p?.name} by ${me.name}` : `Unassigned by ${me.name}`, pid);
    },
    remove: async (id) => {
      const r = await run(() => api.remove(id), `#${id} deleted`);
      if (r) { setIncidents((l) => l.filter((i) => i.id !== id)); setOpenIncidentId(null); }
    },
    note: (id, text) => {
      patchExtras(id, (e) => ({ ...e, notes: [{ id: uid(), author: me.name, text, at: new Date().toISOString() }, ...(e.notes || [])] }));
      addLog(id, `Note added by ${me.name}`);
    },
    addEvidence: (id, items) => {
      if (!items.length) return;
      patchExtras(id, (e) => ({ ...e, evidence: [...items, ...(e.evidence || [])] }));
      addLog(id, `${items.length} evidence file(s) attached by ${me.name}`);
      toast(`${items.length} evidence file(s) added to #${id}`, "ok");
    },
    removeEvidence: (id, eid) => patchExtras(id, (e) => ({ ...e, evidence: (e.evidence || []).filter((v) => v.id !== eid) })),
  };

  const createIncident = async (data) => {
    const r = await run(() => api.create(data));
    if (!r) return false;
    const n = normIncident(r);
    seen.current?.add(n.id);
    setIncidents((l) => [n, ...l]);
    setReporting(false);
    if (n.severity === "critical") raiseAlert(n.id); else toast(`Incident #${n.id} reported`, "ok");
    return true;
  };

  const setPersonStatus = (pid, status) => setPresence((x) => ({ ...x, [pid]: status }));

  const timelineOf = (i) => [
    ...((extras[i.id]?.timeline) || []),
    ...(i.assignee && !(extras[i.id]?.timeline || []).some((t) => /Assigned/.test(t.text)) ? [{ id: `a${i.id}`, at: i.reportedAt, text: `Assigned to ${i.assignee.name}` }] : []),
    { id: `r${i.id}`, at: i.reportedAt, text: `Incident #${i.id} reported by ${i.reporter.name}${i.severity === "critical" ? " (CRITICAL)" : ""}` },
  ];

  /* Ctrl+K = search */
  useEffect(() => {
    const k = (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); searchRef.current?.focus(); } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  /* ---------- derived ---------- */
  const count = (fn) => incidents.filter(fn).length;
  const sev = Object.fromEntries(SEVERITIES.map((s) => [s, count((i) => i.severity === s)]));
  const pct = (n) => `${incidents.length ? (n / incidents.length) * 100 : 0}%`;
  const employees = people.filter((p) => p.role === "ANALYST" || p.role === "ADMIN");
  const workers = people.filter((p) => p.role === "WORKER");
  const unassignedOpen = count((i) => !i.assigneeId && isOpen(i));
  const workload = (pid) => workOf(pid, incidents).active.length;

  const stats = [
    { key: "total", label: "Total Incidents", value: incidents.length, icon: I.shield, go: ["incidents", "all"] },
    { key: "reported", label: "Reported", value: count((i) => GROUP[i.status] === "reported"), icon: I.doc, go: ["incidents", "reported"] },
    { key: "assigned", label: "Assigned", value: count((i) => GROUP[i.status] === "assigned"), icon: I.user, go: ["incidents", "assigned"] },
    { key: "progress", label: "In Progress", value: count((i) => GROUP[i.status] === "progress"), icon: I.clock, go: ["incidents", "progress"] },
    { key: "solved", label: "Solved", value: count((i) => GROUP[i.status] === "solved"), icon: I.check, go: ["incidents", "solved"] },
    { key: "employees", label: "Staff", value: employees.length, icon: I.users, go: ["employees", "all"] },
    { key: "critical", label: "Critical Open", value: count((i) => i.severity === "critical" && isOpen(i)), icon: I.alert, go: ["incidents", "critical"] },
    { key: "high", label: "High Open", value: count((i) => i.severity === "high" && isOpen(i)), icon: I.alert, go: ["incidents", "high"] },
  ];

  const filtered = useMemo(() => {
    let l = incidents;
    if (SEVERITIES.includes(filter)) l = l.filter((i) => i.severity === filter);
    else if (filter === "unassigned") l = l.filter((i) => !i.assigneeId && isOpen(i));
    else if (filter === "mine") l = l.filter((i) => i.assigneeId === me.id);
    else if (filter !== "all") l = l.filter((i) => GROUP[i.status] === filter);
    if (query) {
      const q = query.toLowerCase();
      l = l.filter((i) => `#${i.id} ${i.title} ${i.type} ${i.reporter.name} ${i.reporter.email} ${i.assignee?.name || ""}`.toLowerCase().includes(q));
    }
    return l;
  }, [incidents, filter, query, me.id]);

  const feed = useMemo(() => incidents.flatMap((i) => timelineOf(i).map((t) => ({ ...t, ref: i.id })))
    .sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 6), [incidents, extras]); // eslint-disable-line

  const go = (v, f = "all") => { setView(v); setFilter(f); };
  const isActive = (v, f) => view === v && (f === undefined || filter === f);

  const date = now.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const [hh, mm, ss] = [now.getHours(), now.getMinutes(), now.getSeconds()].map((n) => String(n).padStart(2, "0"));
  const [eyebrow, title, sub] = VIEW_TITLES[view];

  const navItem = ({ v, f, icon, dot, label, badge, sevItem }) => (
    <a key={`${v}-${f ?? ""}`} className={`nav-item ${isActive(v, f) ? (sevItem ? `active-${f}` : "active") : ""}`} onClick={() => go(v, f ?? "all")}>
      {dot ? <i className={`dot dot-${dot}`} /> : icon}
      <span className="grow">{label}</span>
      {badge !== undefined && <span className={`nav-badge ${sevItem ? `nb-${f}` : ""}`}>{badge}</span>}
    </a>
  );

  return (
    <div className={`app ${alert ? "alert-mode" : ""} ${haunted ? "haunted" : ""} ${flicker ? "flicker" : ""}`}>
      <MatrixRain flicker={flicker || alert} />
      <HauntLayer active={haunted} />

      {alert && (
        <div className={`alert-banner ${bannerHiding ? "hide" : ""}`}>
          <span className="alert-icon">{I.alert}</span>
          <div>
            <h2 className="alert-title glitch" data-text="INTRUSION DETECTED">INTRUSION DETECTED</h2>
            <p className="alert-text">A new critical incident was reported. Immediate attention required.</p>
          </div>
        </div>
      )}

      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">{I.shield}</div>
          <div>
            <div className="brand-title">CYBERGUARD</div>
            <div className="brand-sub">{isAdmin ? "Admin Control" : "Analyst Console"}</div>
          </div>
        </div>

        <nav className="nav">
          {isAdmin && navItem({ v: "command", icon: I.radar, label: "Command Center" })}
          {isAdmin && navItem({ v: "triage", icon: I.board, label: "Triage Board", badge: unassignedOpen })}
          {navItem({ v: "dashboard", icon: I.grid, label: "Dashboard" })}
          {navItem({ v: "employees", icon: I.users, label: "Employees", badge: employees.length })}
          {navItem({ v: "workers", icon: I.wrench, label: "Workers", badge: workers.length })}
          {navItem({ v: "incidents", f: "all", icon: I.list, label: "All Incidents", badge: incidents.length })}
          {!isAdmin && navItem({ v: "incidents", f: "mine", icon: I.user, label: "Assigned to Me", badge: count((i) => i.assigneeId === me.id && isOpen(i)) })}
          {navItem({ v: "network", icon: I.globe, label: "Live Network" })}

          <p className="nav-section">Severity</p>
          {SEVERITIES.map((s) => navItem({ v: "incidents", f: s, dot: s, label: cap(s), badge: sev[s], sevItem: true }))}

          <p className="nav-section">Status</p>
          {navItem({ v: "incidents", f: "reported", icon: I.doc, label: "Reported", badge: count((i) => GROUP[i.status] === "reported") })}
          {navItem({ v: "incidents", f: "unassigned", icon: I.user, label: "Unassigned", badge: unassignedOpen })}
          {navItem({ v: "incidents", f: "progress", icon: I.clock, label: "In Progress", badge: count((i) => GROUP[i.status] === "progress") })}
          {navItem({ v: "incidents", f: "solved", icon: I.check, label: "Solved", badge: count((i) => GROUP[i.status] === "solved") })}
        </nav>

        <div className="sidebar-footer nav">
          <a className={`nav-item ${haunted ? "haunt-on" : ""}`} onClick={() => setHaunted(!haunted)}>
            {I.skull}<span className="grow">Haunted Mode</span><span className={`switch ${haunted ? "on" : ""}`} />
          </a>
          <a className="nav-item" onClick={onLogout}>{I.logout}Logout</a>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="main">
        <header className="topbar">
          <label className="search">
            {I.search}
            <input ref={searchRef} placeholder="Search incidents, people…" value={query}
              onChange={(e) => { setQuery(e.target.value); if (view === "dashboard" || view === "network") setView("incidents"); }} />
            <kbd>Ctrl K</kbd>
          </label>
          <div className="topbar-right">
            {haunted && <WatchingEye />}
            <button className="icon-btn" onClick={() => load()} title="Refresh from server">{I.refresh}</button>
            <button className="bell" onClick={() => go("incidents", "critical")} title="Open critical incidents">
              {I.bell}{count((i) => i.severity === "critical" && isOpen(i)) > 0 && <span className="bell-badge" />}
            </button>
            <div className="user">
              <Avatar p={{ name: me.name, color: "#00e5ff" }} />
              <div>
                <div className="user-name">{me.name}</div>
                <div className="user-role">{ROLE_LABEL[me.role] || me.role}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="page-header">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <ScrambleText as="h1" className="page-title glitch hover-glitch" text={title} />
            <p className="page-sub">{sub}</p>
          </div>
          <div className="datetime">
            <span className="date">{date}</span>
            <div className="clock">{hh}<span className="clock-colon">:</span>{mm}<small>{ss} sec</small></div>
          </div>
        </div>

        {loadError && (
          <div className="error-panel">
            {I.alert}
            <div className="grow"><b>Couldn't load data from the server.</b><p>{loadError}</p></div>
            <button className="btn" onClick={() => { setLoading(true); load(); }}>{I.refresh}Retry</button>
          </div>
        )}
        {loading && !loadError && <p className="empty">Connecting to CyberGuard server…</p>}

        {(view === "dashboard" || view === "incidents") && !loading && (
          <section className="stats">
            {stats.map((s) => (
              <button key={s.key} className={`stat-card stat-${s.key} ${alert && s.key === "critical" ? "highlight" : ""}`} onClick={() => go(...s.go)}>
                <div className="stat-icon">{s.icon}</div>
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value updated" key={s.value}>{s.value}</div>
                </div>
              </button>
            ))}
          </section>
        )}

        {/* ---------- DASHBOARD ---------- */}
        {view === "dashboard" && !loading && (
          <section className="grid-main">
            <section className="panel">
              <div className="panel-head"><h3 className="panel-title">Incident Overview</h3></div>
              <div className="overview-body">
                <div className="donut" style={{ "--c": pct(sev.critical), "--h": pct(sev.high), "--m": pct(sev.medium), "--n": pct(sev.low) }}>
                  <div className="donut-center"><div className="donut-value">{incidents.length}</div><div className="donut-label">Total</div></div>
                </div>
                <div className="legend">
                  {SEVERITIES.map((s) => (
                    <a key={s} className="legend-item" onClick={() => go("incidents", s)}>
                      <i className={`dot dot-${s}`} />{cap(s)}
                      <span className="count">{sev[s]} ({incidents.length ? Math.round((sev[s] / incidents.length) * 100) : 0}%)</span>
                    </a>
                  ))}
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="panel-head">
                <h3 className="panel-title">Recent Incidents</h3>
                <a className="panel-link" onClick={() => go("incidents")}>View all →</a>
              </div>
              <IncidentTable rows={incidents.slice(0, 6)} onOpen={setOpenIncidentId} compact />
            </section>

            <section className="panel">
              <div className="panel-head"><h3 className="panel-title">Quick Actions</h3></div>
              <button className="btn-primary" onClick={() => setReporting(true)}>{I.plus}Report New Incident</button>
              <div className="quick-grid">
                <button className="btn" onClick={() => go("incidents", isAdmin ? "unassigned" : "mine")}>
                  {I.user}{isAdmin ? `Assign (${unassignedOpen})` : "My Queue"}
                </button>
                <button className="btn" onClick={() => go("employees")}>{I.users}Staff</button>
              </div>
              <h4 className="feed-title">Activity Feed</h4>
              <ul className="feed">
                {feed.map((f) => (
                  <li key={`${f.ref}-${f.id}`} className={`feed-item ${/CRITICAL/.test(f.text) ? "critical" : /Resolved|Closed/.test(f.text) ? "solved" : ""}`} onClick={() => setOpenIncidentId(f.ref)}>
                    <span className="feed-icon">{/Resolved|Closed/.test(f.text) ? I.check : /CRITICAL/.test(f.text) ? I.alert : I.user}</span>
                    <div><b>#{f.ref}</b> {f.text}<span className="feed-time">{ago(f.at)}</span></div>
                  </li>
                ))}
                {!feed.length && <li className="muted">No activity yet.</li>}
              </ul>
            </section>
          </section>
        )}

        {/* ---------- ALL INCIDENTS ---------- */}
        {view === "incidents" && !loading && (
          <section className="panel panel-enter" key={filter}>
            <div className="panel-head wrap">
              <div className="chips">
                {["all", ...(isAdmin ? [] : ["mine"]), ...SEVERITIES, "reported", "unassigned", "assigned", "progress", "solved"].map((f) => (
                  <button key={f} className={`chip ${filter === f ? "active" : ""} ${SEVERITIES.includes(f) ? `chip-${f}` : ""}`} onClick={() => setFilter(f)}>
                    {f === "all" ? "All" : f === "mine" ? "Assigned to me" : GROUP_LABEL[f] || cap(f)}
                  </button>
                ))}
              </div>
              <button className="btn btn-primary-sm" onClick={() => setReporting(true)}>{I.plus}Report Incident</button>
            </div>
            <IncidentTable rows={filtered} onOpen={setOpenIncidentId} />
          </section>
        )}

        {view === "employees" && !loading && (
          <PeopleView roles={["ANALYST", "ADMIN"]} people={people} incidents={incidents} query={query} onOpen={setOpenPersonId}
            emptyHint="No analysts or admins found. Staff come from GET /api/users/staff." />
        )}
        {view === "workers" && !loading && (
          <PeopleView roles={["WORKER"]} people={people} incidents={incidents} query={query} onOpen={setOpenPersonId}
            emptyHint="No workers yet. Your backend only has USER, ANALYST and ADMIN roles. Add WORKER to Role.java and include it in GET /api/users/staff, and workers will appear here." />
        )}
        {view === "network" && <NetworkPanels haunted={haunted} />}
        {view === "command" && !loading && (
          <CommandCenter incidents={incidents} people={people} now={now.getTime()} go={go}
            onOpen={setOpenIncidentId} onOpenPerson={setOpenPersonId} />
        )}
        {view === "triage" && !loading && (
          <TriageBoard incidents={incidents} people={people} now={now.getTime()} actions={actions}
            onOpen={setOpenIncidentId} workload={workload} />
        )}

        <div className={`terminal ${alert ? "alert" : ""} ${GHOST_LINES.includes(terminal) ? "ghostly" : ""}`}>
          <div className="terminal-line typing" key={terminal}>root@cyberguard:~$ {terminal}<span className="cursor" /></div>
          <div className="system-online">{loadError ? "SERVER OFFLINE" : "SYSTEM ONLINE"} · {me.email}</div>
        </div>
      </main>

      {/* ================= OVERLAYS ================= */}
      {openPerson && (
        <PersonDrawer person={openPerson} incidents={incidents} extras={extras} canAssign={isAdmin} actions={actions}
          onSetStatus={setPersonStatus} onClose={() => setOpenPersonId(null)} onOpenIncident={setOpenIncidentId} />
      )}
      {openIncident && (
        <IncidentModal
          incident={openIncident}
          extras={extras[openIncident.id]}
          timeline={timelineOf(openIncident)}
          staff={people}
          can={can}
          actions={actions}
          workload={workload}
          onClose={() => setOpenIncidentId(null)}
          onOpenPerson={(pid) => { if (byId[pid]) { setOpenIncidentId(null); setOpenPersonId(pid); } }}
        />
      )}
      {reporting && (
        <Overlay onClose={() => setReporting(false)}>
          <div className="modal">
            <header className="modal-head">
              <div><p className="eyebrow">New report</p><h2 className="modal-title">Report Incident</h2></div>
              <button type="button" className="icon-btn" onClick={() => setReporting(false)}>{I.x}</button>
            </header>
            <ReportForm onSubmit={createIncident} onCancel={() => setReporting(false)} />
          </div>
        </Overlay>
      )}

      <Toasts toasts={toasts} />
    </div>
  );
}