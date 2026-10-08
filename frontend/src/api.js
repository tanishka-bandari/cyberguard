/* ============================================================
   CyberGuard — connection to the Spring Boot backend
   ------------------------------------------------------------
   All requests go to /api/... . In development Vite forwards
   them to http://localhost:8080 (see vite.config.js proxy).
   To use another server, create frontend/.env with:
       VITE_API_URL=http://localhost:8080
   ============================================================ */

const BASE = import.meta.env.VITE_API_URL || "";

let token = null;
let onUnauthorized = () => {};

export const setToken = (t) => { token = t; };
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

/* ---------- enums (match your Java enums exactly) ---------- */
export const ROLES = ["USER", "ANALYST", "ADMIN"];

export const INCIDENT_TYPES = [
  "PHISHING", "MALWARE", "RANSOMWARE", "DATA_BREACH",
  "UNAUTHORIZED_ACCESS", "DDOS", "SOCIAL_ENGINEERING", "OTHER",
];

/* frontend uses lowercase keys for CSS classes; backend uses LOW/MEDIUM/HIGH/CRITICAL */
export const SEVERITIES = ["critical", "high", "medium", "low"];

export const STATUSES = [
  "REPORTED", "TRIAGED", "ASSIGNED", "UNDER_INVESTIGATION", "CONTAINED", "RESOLVED", "CLOSED",
];

export const STATUS_LABEL = {
  REPORTED: "Reported",
  TRIAGED: "Triaged",
  ASSIGNED: "Assigned",
  UNDER_INVESTIGATION: "Under Investigation",
  CONTAINED: "Contained",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

/* progress bar is derived from status (the backend has no % field) */
export const PROGRESS = {
  REPORTED: 0, TRIAGED: 15, ASSIGNED: 25, UNDER_INVESTIGATION: 50, CONTAINED: 75, RESOLVED: 95, CLOSED: 100,
};

/* groups used by the sidebar, stat cards and CSS colours */
export const GROUP = {
  REPORTED: "reported", TRIAGED: "progress", ASSIGNED: "assigned",
  UNDER_INVESTIGATION: "progress", CONTAINED: "progress", RESOLVED: "solved", CLOSED: "solved",
};
export const GROUP_LABEL = {
  reported: "Reported", assigned: "Assigned", progress: "In Progress", solved: "Solved", unassigned: "Unassigned",
};

export const typeLabel = (t = "") =>
  t.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");

export const isOpen = (i) => GROUP[i.status] !== "solved";

/* ---------- low-level request ---------- */
async function request(method, path, { params, form, json, auth = true } = {}) {
  const url = new URL(BASE + path, window.location.origin);
  if (params) Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));

  const headers = {};
  let body;
  if (token && auth) headers.Authorization = `Bearer ${token}`;
  if (json) { headers["Content-Type"] = "application/json"; body = JSON.stringify(json); }
  if (form) {
    /* @RequestParam values are sent in the body (not the URL) so passwords never appear in URLs/logs */
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = new URLSearchParams(Object.entries(form).filter(([, v]) => v != null)).toString();
  }

  let res;
  try {
    res = await fetch(url, { method, headers, body });
  } catch {
    throw new Error("Cannot reach the server. Is the Spring Boot backend running on port 8080?");
  }

  if (!res.ok) {
    let msg = "";
    try {
      const text = await res.text();
      try { const j = JSON.parse(text); msg = j.message || j.error || ""; } catch { msg = text.slice(0, 200); }
    } catch { /* ignore */ }

    if (!auth) throw new Error(msg && !/^(Unauthorized|Forbidden|Internal Server Error)$/i.test(msg) ? msg : "Invalid email or password.");
    if (res.status === 401) { onUnauthorized(); throw new Error("Session expired. Please log in again."); }
    if (res.status === 403) throw new Error("You don't have permission to do that.");
    throw new Error(msg || `Server error (${res.status})`);
  }

  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/* ---------- endpoints ---------- */
export const api = {
  login: (email, password) => request("POST", "/api/auth/login", { json: { email, password }, auth: false }),
  register: (name, email, password) => request("POST", "/api/auth/register", { form: { name, email, password }, auth: false }),

  incidents: () => request("GET", "/api/incidents"),
  incidentsByUser: (userId) => request("GET", `/api/incidents/user/${userId}`),
  create: (d) => request("POST", "/api/incidents", { form: d }),
  setStatus: (id, status) => request("PUT", `/api/incidents/${id}/status`, { form: { status } }),
  assign: (id, userId) => request("PUT", `/api/incidents/${id}/assign`, { form: { userId } }),
  unassign: (id) => request("PUT", `/api/incidents/${id}/unassign`),
  remove: (id) => request("DELETE", `/api/incidents/${id}`),

  staff: () => request("GET", "/api/users/staff"),
};

/* ---------- JWT helpers ---------- */
function jwtPayload(t) {
  try { return JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))); } catch { return {}; }
}
export const tokenExpired = (t) => { const p = jwtPayload(t); return !!p.exp && p.exp * 1000 < Date.now(); };

export function sessionFromLogin(r) {
  const p = jwtPayload(r.token);
  return {
    token: r.token,
    user: {
      id: r.id,
      name: r.name || p.name || r.email,
      email: r.email || p.sub,
      role: String(r.role || p.role || "USER").replace(/^ROLE_/, "").toUpperCase(),
    },
  };
}

/* ---------- normalise backend DTOs ---------- */
const first = (...v) => v.find((x) => x !== undefined && x !== null && x !== "");
const toIso = (v) => (Array.isArray(v) ? new Date(v[0], v[1] - 1, v[2], v[3] || 0, v[4] || 0, v[5] || 0).toISOString() : v);

export function normIncident(d) {
  const aid = first(d.assignedToId, d.assignedTo?.id);
  return {
    id: d.id,
    title: d.title || "Untitled",
    description: d.description || "",
    type: d.type || "OTHER",
    severity: String(d.severity || "LOW").toLowerCase(),
    status: d.status || "REPORTED",
    riskScore: Number(d.riskScore ?? 0),
    reporter: {
      id: first(d.reportedById, d.reportedBy?.id),
      name: first(d.reportedByName, d.reportedBy?.name, "Unknown"),
      email: first(d.reportedByEmail, d.reportedBy?.email, ""),
    },
    assigneeId: aid ?? null,
    assignee: aid != null
      ? { id: aid, name: first(d.assignedToName, d.assignedTo?.name, "Staff"), email: first(d.assignedToEmail, d.assignedTo?.email, "") }
      : null,
    reportedAt: toIso(d.reportedAt) || new Date().toISOString(),
  };
}

const COLORS = ["#00e5ff", "#ff2d55", "#ffc400", "#22e07a", "#3d7bff", "#b14dff", "#00ffc8", "#ff8a00", "#ff5c9a", "#9aff4d"];
export const normUser = (u) => ({
  id: u.id,
  name: u.name || u.email,
  email: u.email || "",
  role: String(u.role || "ANALYST").toUpperCase(),
  color: COLORS[Math.abs(Number(u.id) || 0) % COLORS.length],
});