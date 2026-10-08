/* What a USER sees: only the incidents THEY reported.
   Pages: Overview · Report (wizard) · My Cases · Stay Safe */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  api, normIncident, INCIDENT_TYPES, SEVERITIES, STATUS_LABEL, PROGRESS, GROUP, isOpen, typeLabel,
} from "./api";
import {
  I, cap, uid, ago, fmtSize, usePersisted, useNow, useToasts, useHaunt,
  MatrixRain, WatchingEye, HauntLayer, ScrambleText, ThreatGauge, threatScore,
  Avatar, Progress, Toasts, IncidentModal, StatusStepper,
} from "./ui";

const BASE_TERM = "secure channel open · your reports are encrypted";

const TYPE_INFO = {
  PHISHING: { icon: I.mail, desc: "Suspicious email, message or fake login page", tips: ["Hover over links before clicking. Check the real address.", "No real company asks for your password by email.", "Report it, then delete it. Don't forward it to colleagues."] },
  MALWARE: { icon: I.bug, desc: "Strange pop-ups, slow PC, unknown programs", tips: ["Disconnect from Wi-Fi if you think you're infected.", "Never install software from links in emails.", "Keep your system and antivirus updated."] },
  RANSOMWARE: { icon: I.lock, desc: "Files locked or renamed, ransom note shown", tips: ["Unplug the network cable immediately.", "Do NOT pay the ransom or contact the attackers.", "Don't turn the PC off; it may hold evidence."] },
  DATA_BREACH: { icon: I.db, desc: "Data leaked, sent to the wrong place or exposed", tips: ["Note exactly what data and who received it.", "Don't try to 'unsend' or delete logs yourself.", "Change passwords for any affected accounts."] },
  UNAUTHORIZED_ACCESS: { icon: I.key, desc: "Someone logged in who shouldn't have", tips: ["Change your password from a different device.", "Turn on two-factor authentication everywhere.", "Check for unknown sessions and log them out."] },
  DDOS: { icon: I.wave, desc: "Website or service flooded and unreachable", tips: ["Note the time it started and what stopped working.", "Avoid repeatedly refreshing; it adds load.", "Use the status page or official channels for updates."] },
  SOCIAL_ENGINEERING: { icon: I.users, desc: "Someone tricked or pressured you for information", tips: ["Hang up and call back on a number you trust.", "Urgency and secrecy are red flags.", "It's okay to say no, even to 'management'."] },
  OTHER: { icon: I.alert, desc: "Anything else that feels wrong", tips: ["If something feels off, report it. False alarms are fine.", "Write down what you saw while it's fresh.", "Screenshots help analysts a lot."] },
};

const SEV_INFO = {
  low: "Minor, nothing seems damaged",
  medium: "Something is wrong but contained",
  high: "Accounts, data or systems at risk",
  critical: "Active attack, spreading or data being stolen",
};

/* ================= REPORT WIZARD ================= */
function ReportWizard({ onSubmit, onDone }) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ type: "", severity: "", riskScore: 50, title: "", description: "" });
  const [files, setFiles] = useState([]);
  const [phase, setPhase] = useState("form"); // form | sending | done
  const [created, setCreated] = useState(null);
  const fileRef = useRef(null);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  const readFiles = (list) =>
    Promise.all([...list].map((file) => new Promise((res) => {
      const base = { id: uid(), name: file.name, size: file.size, type: file.type, at: new Date().toISOString() };
      if (file.type.startsWith("image/") && file.size < 800000) {
        const r = new FileReader(); r.onload = () => res({ ...base, url: r.result }); r.readAsDataURL(file);
      } else res(base);
    }))).then((items) => setFiles((x) => [...x, ...items]));

  const canNext = [!!f.type, !!f.severity, f.title.trim() && f.description.trim(), true][step];

  const transmit = async () => {
    setPhase("sending");
    const started = Date.now();
    const inc = await onSubmit({
      title: f.title.trim(), description: f.description.trim(), type: f.type,
      severity: f.severity.toUpperCase(), riskScore: Number(f.riskScore),
    }, files);
    await new Promise((r) => setTimeout(r, Math.max(0, 1800 - (Date.now() - started))));
    if (inc) { setCreated(inc); setPhase("done"); } else setPhase("form");
  };

  if (phase === "sending") {
    return (
      <section className="panel transmit">
        <div className="transmit-ring">{I.radar}</div>
        <ScrambleText as="h2" className="transmit-title glitch" text="TRANSMITTING REPORT" />
        <p className="muted">Encrypting · routing to the security team · do not close this window</p>
        <div className="progress transmit-bar"><span style={{ width: "100%" }} /></div>
      </section>
    );
  }

  if (phase === "done") {
    return (
      <section className="panel transmit done">
        <div className="transmit-ring ok">{I.check}</div>
        <ScrambleText as="h2" className="transmit-title" text={`CASE #${created.id} OPENED`} />
        <p className="muted">An analyst will pick it up soon. You'll see every step they take.</p>
        <div className="btn-row center">
          <button className="btn" onClick={() => { setF({ type: "", severity: "", riskScore: 50, title: "", description: "" }); setFiles([]); setStep(0); setPhase("form"); }}>{I.plus}Report another</button>
          <button className="btn btn-primary-sm" onClick={() => onDone(created.id)}>{I.eye}Track this case</button>
        </div>
      </section>
    );
  }

  const STEPS = ["What happened?", "How bad is it?", "Tell us more", "Review & send"];

  return (
    <section className="panel wizard">
      <ol className="wiz-steps">
        {STEPS.map((s, k) => (
          <li key={s} className={k < step ? "done" : k === step ? "current" : ""} onClick={() => k < step && setStep(k)}>
            <span>{k + 1}</span>{s}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="type-grid">
          {INCIDENT_TYPES.map((t) => (
            <button key={t} type="button" className={`type-card ${f.type === t ? "active" : ""}`} onClick={() => { set("type", t); setStep(1); }}>
              <span className="type-icon">{TYPE_INFO[t].icon}</span>
              <b>{typeLabel(t)}</b>
              <small>{TYPE_INFO[t].desc}</small>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <>
          <div className="sev-grid">
            {SEVERITIES.slice().reverse().map((s) => (
              <button key={s} type="button" className={`sev-card sev-${s} ${f.severity === s ? "active" : ""}`}
                onClick={() => { set("severity", s); set("riskScore", { low: 20, medium: 45, high: 70, critical: 90 }[s]); }}>
                <span className={`badge badge-${s}`}>{s}</span>
                <small>{SEV_INFO[s]}</small>
              </button>
            ))}
          </div>
          {f.severity && (
            <div className="field" style={{ marginTop: 18 }}>
              <label>Risk score: <b className="risk-num">{f.riskScore}</b> / 100</label>
              <input type="range" min="0" max="100" value={f.riskScore} onChange={(e) => set("riskScore", e.target.value)}
                className={`range range-${f.riskScore >= 75 ? "critical" : f.riskScore >= 50 ? "high" : f.riskScore >= 25 ? "medium" : "low"}`} />
            </div>
          )}
        </>
      )}

      {step === 2 && (
        <div className="form-grid">
          <div className="field span-2"><label>Short title *</label>
            <input className="input" value={f.title} onChange={(e) => set("title", e.target.value)} maxLength={200} placeholder="e.g. Fake Microsoft login email" autoFocus />
          </div>
          <div className="field span-2"><label>What did you see? *</label>
            <textarea className="textarea" rows="5" value={f.description} onChange={(e) => set("description", e.target.value)} maxLength={2000}
              placeholder="When did it happen? What device? What did you click or notice?" />
          </div>
          <div className="field span-2"><label>Evidence (optional, kept on this device)</label>
            <div className="dropzone" onClick={() => fileRef.current.click()}
              onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); readFiles(e.dataTransfer.files); }}>
              {I.upload}<span>Drop screenshots here, or <u>browse</u></span>
              <input ref={fileRef} type="file" multiple hidden onChange={(e) => { readFiles(e.target.files); e.target.value = ""; }} />
            </div>
            {!!files.length && <p className="muted">{files.map((x) => `${x.name} (${fmtSize(x.size)})`).join(" · ")}</p>}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="review">
          <div className="review-head">
            <span className="type-icon">{TYPE_INFO[f.type].icon}</span>
            <div className="grow"><b>{f.title}</b><p className="muted">{typeLabel(f.type)} · risk {f.riskScore}/100</p></div>
            <span className={`badge badge-${f.severity}`}>{f.severity}</span>
          </div>
          <p className="desc">{f.description}</p>
          {!!files.length && <p className="muted">{files.length} evidence file(s) attached</p>}
        </div>
      )}

      <div className="btn-row end">
        {step > 0 && <button type="button" className="btn" onClick={() => setStep(step - 1)}>Back</button>}
        {step < 3 && step !== 0 && <button type="button" className="btn btn-primary-sm" disabled={!canNext} onClick={() => setStep(step + 1)}>Next</button>}
        {step === 3 && <button type="button" className="btn btn-danger transmit-btn" onClick={transmit}>{I.radar}TRANSMIT REPORT</button>}
      </div>
    </section>
  );
}

/* ================= PORTAL ================= */
export default function UserPortal({ session, onLogout }) {
  const me = session.user;
  const now = useNow();
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [view, setView] = useState("overview");
  const [caseFilter, setCaseFilter] = useState("open");
  const [openId, setOpenId] = useState(null);
  const [extras, setExtras] = usePersisted("cg.extras.v3", {});
  const [log, setLog] = usePersisted(`cg.userlog.${me.id}`, []);
  const [haunted, setHaunted] = usePersisted("cg.haunted", true);
  const [toasts, toast] = useToasts();
  const { flicker, terminal } = useHaunt(haunted, toast, BASE_TERM);
  const lastStatus = useRef(null);

  /* only incidents this user reported (the backend already filters; this is a second guard) */
  const mine = useMemo(() => all.filter((i) =>
    (me.id != null && i.reporter.id === me.id) || (me.email && i.reporter.email === me.email) || (i.reporter.id == null && !i.reporter.email)
  ), [all, me.id, me.email]);

  const load = useCallback(async (quiet) => {
    try {
      const list = (await api.incidents()).map(normIncident).sort((a, b) => b.id - a.id);
      if (lastStatus.current) {
        const changes = [];
        list.forEach((i) => {
          const prev = lastStatus.current.get(i.id);
          if (prev && prev !== i.status) changes.push({ id: uid(), at: new Date().toISOString(), ref: i.id, text: `Status changed to ${STATUS_LABEL[i.status]}${i.assignee ? ` by ${i.assignee.name}'s team` : ""}`, status: i.status });
        });
        if (changes.length) {
          setLog((l) => [...changes, ...l].slice(0, 100));
          changes.forEach((c) => toast(`Case #${c.ref} is now ${STATUS_LABEL[c.status]}`, GROUP[c.status] === "solved" ? "ok" : "info"));
        }
      }
      lastStatus.current = new Map(list.map((i) => [i.id, i.status]));
      setAll(list);
      setLoadError("");
    } catch (e) {
      if (!quiet) setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  }, [toast, setLog]);

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 20000);
    return () => clearInterval(t);
  }, [load]);

  const patchExtras = (id, fn) => setExtras((x) => ({ ...x, [id]: fn(x[id] || {}) }));

  const create = async (data, files) => {
    try {
      const n = normIncident(await api.create(data));
      lastStatus.current?.set(n.id, n.status);
      setAll((l) => [n, ...l]);
      if (files.length) patchExtras(n.id, (e) => ({ ...e, evidence: [...files, ...(e.evidence || [])] }));
      setLog((l) => [{ id: uid(), at: new Date().toISOString(), ref: n.id, text: "Report transmitted to the security team", status: n.status }, ...l]);
      return n;
    } catch (e) {
      toast(e.message, "error");
      return null;
    }
  };

  const actions = {
    note: (id, text) => patchExtras(id, (e) => ({ ...e, notes: [{ id: uid(), author: me.name, text, at: new Date().toISOString() }, ...(e.notes || [])] })),
    addEvidence: (id, items) => { patchExtras(id, (e) => ({ ...e, evidence: [...items, ...(e.evidence || [])] })); toast(`${items.length} file(s) attached`, "ok"); },
    removeEvidence: (id, eid) => patchExtras(id, (e) => ({ ...e, evidence: (e.evidence || []).filter((v) => v.id !== eid) })),
  };

  const open = mine.find((i) => i.id === openId);
  const openCases = mine.filter(isOpen);
  const resolved = mine.filter((i) => !isOpen(i));
  const cases = caseFilter === "open" ? openCases : caseFilter === "resolved" ? resolved : mine;
  const myTypes = [...new Set(mine.map((i) => i.type))];
  const myLog = log.filter((l) => mine.some((i) => i.id === l.ref)).slice(0, 8);
  const timelineFor = (i) => [
    ...log.filter((l) => l.ref === i.id),
    { id: `r${i.id}`, at: i.reportedAt, text: "You reported this incident" },
  ];

  const date = now.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const [hh, mm, ss] = [now.getHours(), now.getMinutes(), now.getSeconds()].map((n) => String(n).padStart(2, "0"));
  const TITLES = {
    overview: ["Secure Reporting", `Welcome back, ${me.name.split(" ")[0]}`, "Only you and the security team can see your reports."],
    report: ["New Report", "Report an Incident", "Four quick steps. If something feels wrong, it's worth reporting."],
    cases: ["My Cases", "Case Tracker", "Follow every step the security team takes on your reports."],
    tips: ["Stay Safe", "Survival Guide", "What to do, and what never to do, for each kind of attack."],
  };
  const [eyebrow, title, sub] = TITLES[view];

  const nav = (v, icon, label, badge) => (
    <a className={`nav-item ${view === v ? "active" : ""}`} onClick={() => setView(v)}>
      {icon}<span className="grow">{label}</span>
      {badge !== undefined && <span className="nav-badge">{badge}</span>}
    </a>
  );

  const CaseCard = ({ i }) => (
    <article className={`my-incident sev-${i.severity}`} onClick={() => setOpenId(i.id)}>
      <div className="my-incident-top">
        <span className={`badge badge-${i.severity}`}>{i.severity}</span>
        <b className="grow">#{i.id} {i.title}</b>
        <span className={`status-pill status-${GROUP[i.status]}`}>{STATUS_LABEL[i.status]}</span>
      </div>
      <p className="muted">
        {typeLabel(i.type)} · reported {ago(i.reportedAt)} ·{" "}
        {i.assignee ? <>handled by <b className="handler">{i.assignee.name}</b></> : <span className="waiting">waiting for an analyst…</span>}
      </p>
      <Progress value={PROGRESS[i.status]} />
      <StatusStepper status={i.status} disabled />
    </article>
  );

  return (
    <div className={`app user-mode ${haunted ? "haunted" : ""} ${flicker ? "flicker" : ""}`}>
      <MatrixRain flicker={flicker} />
      <HauntLayer active={haunted} />

      {/* ---------- sidebar ---------- */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">{I.shield}</div>
          <div>
            <div className="brand-title">CYBERGUARD</div>
            <div className="brand-sub">Secure Reporting</div>
          </div>
        </div>
        <nav className="nav">
          {nav("overview", I.grid, "Overview")}
          {nav("report", I.alert, "Report Incident")}
          {nav("cases", I.list, "My Cases", openCases.length)}
          {nav("tips", I.bulb, "Stay Safe")}
        </nav>
        <div className="sidebar-footer nav">
          <a className={`nav-item ${haunted ? "haunt-on" : ""}`} onClick={() => setHaunted(!haunted)}>
            {I.skull}<span className="grow">Haunted Mode</span><span className={`switch ${haunted ? "on" : ""}`} />
          </a>
          <a className="nav-item" onClick={onLogout}>{I.logout}Logout</a>
        </div>
      </aside>

      {/* ---------- main ---------- */}
      <main className="main">
        <header className="topbar">
          <div className="secure-pill"><span className="live-dot" />Encrypted session · {me.email}</div>
          <div className="topbar-right">
            {haunted && <WatchingEye />}
            <button className="icon-btn" onClick={() => load()} title="Refresh">{I.refresh}</button>
            <div className="user">
              <Avatar p={{ name: me.name, color: "#00e5ff" }} />
              <div>
                <div className="user-name">{me.name}</div>
                <div className="user-role">Reporter</div>
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
          <div className="error-panel">{I.alert}<div className="grow"><b>Couldn't reach the server.</b><p>{loadError}</p></div>
            <button className="btn" onClick={() => { setLoading(true); load(); }}>{I.refresh}Retry</button></div>
        )}
        {loading && !loadError && <p className="empty">Opening secure channel…</p>}

        {/* ---------- OVERVIEW ---------- */}
        {view === "overview" && !loading && (
          <>
            <section className="user-hero">
              <div className="cc-card cc-gauge"><ThreatGauge score={threatScore(mine)} label="Your exposure" /></div>
              <div className="stat-card stat-total"><div className="stat-icon">{I.doc}</div><div><div className="stat-label">My reports</div><div className="stat-value">{mine.length}</div></div></div>
              <div className="stat-card stat-reported"><div className="stat-icon">{I.alert}</div><div><div className="stat-label">Open cases</div><div className="stat-value">{openCases.length}</div></div></div>
              <div className="stat-card stat-solved"><div className="stat-icon">{I.check}</div><div><div className="stat-label">Resolved</div><div className="stat-value">{resolved.length}</div></div></div>
            </section>

            <section className="user-grid">
              <section className="panel report-cta" onClick={() => setView("report")}>
                <div className="cta-icon">{I.alert}</div>
                <div className="grow">
                  <h3 className="glitch hover-glitch" data-text="SEE SOMETHING STRANGE?">SEE SOMETHING STRANGE?</h3>
                  <p>Report it now. It takes less than a minute, and false alarms are always welcome.</p>
                </div>
                <span className="btn btn-danger">{I.radar}Report incident</span>
              </section>

              <section className="panel">
                <div className="panel-head"><h3 className="panel-title">Active Cases</h3><a className="panel-link" onClick={() => setView("cases")}>All cases →</a></div>
                <div className="my-incidents">
                  {openCases.slice(0, 3).map((i) => <CaseCard key={i.id} i={i} />)}
                  {!openCases.length && <p className="empty">No open cases. The shadows are quiet.</p>}
                </div>
              </section>

              <section className="panel">
                <div className="panel-head"><h3 className="panel-title">Latest Updates</h3><span className="muted">checks every 20s</span></div>
                <ul className="feed">
                  {myLog.map((l) => (
                    <li key={l.id} className={`feed-item ${GROUP[l.status] === "solved" ? "solved" : ""}`} onClick={() => setOpenId(l.ref)}>
                      <span className="feed-icon">{GROUP[l.status] === "solved" ? I.check : I.bell}</span>
                      <div><b>#{l.ref}</b> {l.text}<span className="feed-time">{ago(l.at)}</span></div>
                    </li>
                  ))}
                  {!myLog.length && <li className="muted">Updates on your cases will appear here.</li>}
                </ul>
              </section>
            </section>
          </>
        )}

        {/* ---------- REPORT ---------- */}
        {view === "report" && <ReportWizard onSubmit={create} onDone={(id) => { setView("cases"); setCaseFilter("open"); setOpenId(id); }} />}

        {/* ---------- CASES ---------- */}
        {view === "cases" && !loading && (
          <section className="panel panel-enter" key={caseFilter}>
            <div className="panel-head wrap">
              <div className="chips">
                {[["open", `Open (${openCases.length})`], ["resolved", `Resolved (${resolved.length})`], ["all", `All (${mine.length})`]].map(([k, l]) => (
                  <button key={k} className={`chip ${caseFilter === k ? "active" : ""}`} onClick={() => setCaseFilter(k)}>{l}</button>
                ))}
              </div>
              <button className="btn btn-primary-sm" onClick={() => setView("report")}>{I.plus}New report</button>
            </div>
            <div className="my-incidents">
              {cases.map((i) => <CaseCard key={i.id} i={i} />)}
              {!cases.length && <p className="empty">Nothing here.</p>}
            </div>
          </section>
        )}

        {/* ---------- TIPS ---------- */}
        {view === "tips" && (
          <section className="tips-grid">
            {[...INCIDENT_TYPES].sort((a, b) => myTypes.includes(b) - myTypes.includes(a)).map((t) => (
              <article key={t} className={`tip-card ${myTypes.includes(t) ? "relevant" : ""}`}>
                <div className="tip-head">
                  <span className="type-icon">{TYPE_INFO[t].icon}</span>
                  <b>{typeLabel(t)}</b>
                  {myTypes.includes(t) && <span className="flag flag-red">YOU REPORTED THIS</span>}
                </div>
                <ul>{TYPE_INFO[t].tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
              </article>
            ))}
          </section>
        )}

        <div className={`terminal ${terminal !== BASE_TERM ? "ghostly" : ""}`}>
          <div className="terminal-line typing" key={terminal}>guest@cyberguard:~$ {terminal}<span className="cursor" /></div>
          <div className="system-online">{loadError ? "CHANNEL LOST" : "CHANNEL SECURE"} · {cap(me.role.toLowerCase())}</div>
        </div>
      </main>

      {open && (
        <IncidentModal
          incident={open}
          extras={extras[open.id]}
          timeline={timelineFor(open)}
          can={{ status: false, assign: false, del: false, notes: true }}
          actions={actions}
          onClose={() => setOpenId(null)}
        />
      )}

      <Toasts toasts={toasts} />
    </div>
  );
}