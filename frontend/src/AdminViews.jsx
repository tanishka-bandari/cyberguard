/* ADMIN-only views: Command Center + drag-and-drop Triage Board */
import { useMemo, useState } from "react";
import { STATUSES, STATUS_LABEL, GROUP, INCIDENT_TYPES, isOpen, typeLabel } from "./api";
import { I, Avatar, RiskMeter, ThreatGauge, threatScore } from "./ui";

/* how long each severity may stay open before it breaches SLA */
export const SLA_HOURS = { critical: 4, high: 24, medium: 72, low: 168 };

export function slaOf(i, now) {
  const limit = SLA_HOURS[i.severity] * 3600e3;
  const age = now - new Date(i.reportedAt).getTime();
  return { left: limit - age, pct: Math.min(100, (age / limit) * 100), overdue: age > limit };
}

export const fmtDur = (ms) => {
  const m = Math.floor(Math.abs(ms) / 60000);
  const d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60;
  return d ? `${d}d ${h}h` : h ? `${h}h ${mm}m` : `${mm}m`;
};

function SlaTimer({ incident, now }) {
  if (!isOpen(incident)) return <span className="timer done">CLOSED</span>;
  const s = slaOf(incident, now);
  return (
    <span className={`timer ${s.overdue ? "overdue" : s.pct > 75 ? "warn" : ""}`} title={`SLA ${SLA_HOURS[incident.severity]}h for ${incident.severity}`}>
      {I.clock}{s.overdue ? `OVERDUE ${fmtDur(s.left)}` : `${fmtDur(s.left)} left`}
    </span>
  );
}

/* ================= COMMAND CENTER ================= */
export function CommandCenter({ incidents, people, now, onOpen, onOpenPerson, go }) {
  const open = incidents.filter(isOpen);
  const breaches = open.filter((i) => slaOf(i, now).overdue);
  const unassigned = open.filter((i) => !i.assigneeId);
  const staff = people.filter((p) => p.role !== "USER");
  const onDuty = staff.filter((p) => p.status !== "offline");

  const watch = [...open].sort((a, b) => slaOf(a, now).left - slaOf(b, now).left).slice(0, 8);

  const team = staff.map((p) => {
    const mine = incidents.filter((i) => i.assigneeId === p.id);
    const active = mine.filter(isOpen).length;
    const solved = mine.length - active;
    return { p, active, solved, rate: mine.length ? Math.round((solved / mine.length) * 100) : 0 };
  }).sort((a, b) => b.solved - a.solved || a.active - b.active);
  const maxLoad = Math.max(1, ...team.map((t) => t.active));

  const days = useMemo(() => {
    const out = [];
    for (let k = 13; k >= 0; k--) {
      const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - k);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      const list = incidents.filter((i) => { const t = new Date(i.reportedAt); return t >= d && t < next; });
      out.push({ d, total: list.length, critical: list.filter((i) => i.severity === "critical").length });
    }
    return out;
  }, [incidents, Math.floor(now / 3600e3)]); // eslint-disable-line
  const maxDay = Math.max(1, ...days.map((d) => d.total));

  const types = INCIDENT_TYPES.map((t) => ({ t, n: incidents.filter((i) => i.type === t).length }))
    .filter((x) => x.n).sort((a, b) => b.n - a.n);
  const maxType = Math.max(1, ...types.map((x) => x.n));

  return (
    <>
      <section className="cc-top">
        <div className="cc-card cc-gauge"><ThreatGauge score={threatScore(incidents)} label="Network threat" /></div>
        <button className={`cc-card ${breaches.length ? "cc-alarm" : ""}`} onClick={() => go("incidents", "all")}>
          <span className="cc-icon">{I.clock}</span>
          <b>{breaches.length}</b><span>SLA breaches</span>
          <small>{breaches.length ? "Incidents left open too long" : "Every incident within SLA"}</small>
        </button>
        <button className={`cc-card ${unassigned.length ? "cc-warn" : ""}`} onClick={() => go("triage")}>
          <span className="cc-icon">{I.user}</span>
          <b>{unassigned.length}</b><span>Unassigned</span>
          <small>Open incidents nobody owns</small>
        </button>
        <button className="cc-card" onClick={() => go("employees")}>
          <span className="cc-icon">{I.users}</span>
          <b>{onDuty.length}<em>/{staff.length}</em></b><span>Staff on duty</span>
          <small>{open.length} open incidents across the team</small>
        </button>
      </section>

      <section className="cc-grid">
        <section className="panel">
          <div className="panel-head"><h3 className="panel-title">SLA Watchlist</h3><span className="muted">closest to breach first</span></div>
          <ul className="sla-list">
            {watch.map((i) => {
              const s = slaOf(i, now);
              return (
                <li key={i.id} className={`sla-row ${s.overdue ? "overdue" : ""}`} onClick={() => onOpen(i.id)}>
                  <span className={`badge badge-${i.severity}`}>{i.severity}</span>
                  <div className="grow">
                    <div className="sla-title">#{i.id} {i.title}</div>
                    <div className="sla-bar"><span style={{ width: `${s.pct}%` }} /></div>
                  </div>
                  <span className="sla-owner">{i.assignee ? i.assignee.name : <em>UNASSIGNED</em>}</span>
                  <SlaTimer incident={i} now={now} />
                </li>
              );
            })}
            {!watch.length && <li className="empty">No open incidents. Silence… for now.</li>}
          </ul>
        </section>

        <section className="panel">
          <div className="panel-head"><h3 className="panel-title">Team Performance</h3><span className="muted">sorted by resolved</span></div>
          <ul className="team-list">
            {team.map(({ p, active, solved, rate }, k) => (
              <li key={p.id} className="team-row" onClick={() => onOpenPerson(p.id)}>
                <span className="team-rank">{k + 1}</span>
                <Avatar p={p} size="xs" />
                <div className="grow">
                  <div className="team-name">{p.name}
                    {active >= 4 && <span className="flag flag-red">OVERLOADED</span>}
                    {active === 0 && p.status !== "offline" && <span className="flag">IDLE</span>}
                  </div>
                  <div className="wl-bar"><span style={{ width: `${(active / maxLoad) * 100}%`, background: p.color }} /></div>
                </div>
                <span className="team-num"><b>{active}</b>open</span>
                <span className="team-num"><b>{solved}</b>solved</span>
                <span className="team-num"><b>{rate}%</b>rate</span>
              </li>
            ))}
            {!team.length && <li className="empty">No staff returned by the server.</li>}
          </ul>
        </section>

        <section className="panel">
          <div className="panel-head"><h3 className="panel-title">Incidents · Last 14 Days</h3><span className="muted"><i className="dot dot-critical" />critical</span></div>
          <div className="trend">
            {days.map(({ d, total, critical }) => (
              <div key={d.toISOString()} className="trend-col" title={`${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}: ${total} incident(s), ${critical} critical`}>
                <div className="trend-bar" style={{ height: `${(total / maxDay) * 100}%` }}>
                  {critical > 0 && <span style={{ height: `${(critical / total) * 100}%` }} />}
                </div>
                <small>{d.getDate()}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><h3 className="panel-title">Attack Types</h3></div>
          <ul className="type-bars">
            {types.map(({ t, n }) => (
              <li key={t}>
                <span className="type-name">{typeLabel(t)}</span>
                <div className="type-bar"><span style={{ width: `${(n / maxType) * 100}%` }} /></div>
                <b>{n}</b>
              </li>
            ))}
            {!types.length && <li className="empty">No incidents yet.</li>}
          </ul>
        </section>
      </section>
    </>
  );
}

/* ================= TRIAGE BOARD ================= */
export function TriageBoard({ incidents, people, now, actions, onOpen, workload }) {
  const [dragId, setDragId] = useState(null);
  const [overCol, setOverCol] = useState(null);
  const [overPerson, setOverPerson] = useState(null);
  const [showClosed, setShowClosed] = useState(false);
  const staff = people.filter((p) => p.role !== "USER");
  const cols = showClosed ? STATUSES : STATUSES.filter((s) => s !== "CLOSED");

  const idFrom = (e) => Number(e.dataTransfer.getData("text/plain"));
  const end = () => { setDragId(null); setOverCol(null); setOverPerson(null); };

  return (
    <>
      <section className="panel staff-dock">
        <div className="panel-head">
          <h3 className="panel-title">Drop an incident on a person to assign it</h3>
          <label className="muted check"><input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} /> show Closed</label>
        </div>
        <div className="dock">
          {staff.map((p) => (
            <div key={p.id}
              className={`dock-person ${overPerson === p.id ? "over" : ""} ${p.status}`}
              onDragOver={(e) => { e.preventDefault(); setOverPerson(p.id); }}
              onDragLeave={() => setOverPerson(null)}
              onDrop={(e) => { e.preventDefault(); const id = idFrom(e); end(); if (id) actions.assign(id, p.id); }}>
              <Avatar p={p} />
              <div><b>{p.name}</b><small>{workload(p.id)} open · {p.role.toLowerCase()}</small></div>
            </div>
          ))}
          {!staff.length && <p className="muted">No staff loaded.</p>}
        </div>
      </section>

      <section className={`board ${dragId ? "dragging" : ""}`}>
        {cols.map((col) => {
          const list = incidents.filter((i) => i.status === col);
          return (
            <div key={col}
              className={`board-col col-${GROUP[col]} ${overCol === col ? "over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setOverCol(col); }}
              onDragLeave={() => setOverCol((c) => (c === col ? null : c))}
              onDrop={(e) => {
                e.preventDefault();
                const id = idFrom(e);
                const inc = incidents.find((i) => i.id === id);
                end();
                if (inc && inc.status !== col) actions.status(id, col);
              }}>
              <div className="board-head"><span>{STATUS_LABEL[col]}</span><b>{list.length}</b></div>
              <div className="board-cards">
                {list.map((i) => (
                  <article key={i.id}
                    className={`board-card sev-${i.severity} ${dragId === i.id ? "lifted" : ""}`}
                    draggable
                    onDragStart={(e) => { e.dataTransfer.setData("text/plain", String(i.id)); e.dataTransfer.effectAllowed = "move"; setDragId(i.id); }}
                    onDragEnd={end}
                    onClick={() => onOpen(i.id)}>
                    <div className="board-card-top">
                      <span className={`badge badge-${i.severity}`}>{i.severity}</span>
                      <span className="muted">#{i.id}</span>
                    </div>
                    <p className="board-title">{i.title}</p>
                    <RiskMeter value={i.riskScore} />
                    <div className="board-card-foot">
                      {i.assignee ? <span className="assignee-cell"><Avatar p={{ ...i.assignee, color: people.find((p) => p.id === i.assignee.id)?.color }} size="xs" />{i.assignee.name.split(" ")[0]}</span> : <span className="unassigned">Unassigned</span>}
                      <SlaTimer incident={i} now={now} />
                    </div>
                  </article>
                ))}
                {!list.length && <p className="board-empty">empty</p>}
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}