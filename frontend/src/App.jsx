import { useEffect, useState } from "react";
import "./App.css";

const API = "https://cyberguard-production-db91.up.railway.app";

async function getJson(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await getJson(response);

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Login failed"
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      setUser(data);
      setLoggedIn(true);

      setLoginData({
        email: "",
        password: "",
      });
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const formData = new URLSearchParams();

      formData.append("name", registerData.name);
      formData.append("email", registerData.email);
      formData.append("password", registerData.password);

      const response = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const data = await getJson(response);

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Registration failed"
        );
      }

      setMessage("Registration successful! Please login.");

      setRegisterData({
        name: "",
        email: "",
        password: "",
      });

      setShowRegister(false);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setLoggedIn(false);
  };

  if (loggedIn) {
    return (
      <Dashboard
        user={user}
        logout={logout}
      />
    );
  }

  return (
    <div className="auth-page">

      <div className="auth-left">

        <div className="brand">

          <div className="brand-icon">
            🛡️
          </div>

          <div>
            <h1>CyberGuard</h1>
            <p>Incident Reporting & Response</p>
          </div>

        </div>

        <div className="hero-content">

          <span className="security-label">
            CYBERSECURITY OPERATIONS
          </span>

          <h2>
            Detect. Investigate.
            <br />
            <span>Respond.</span>
          </h2>

          <p>
            A centralized platform for reporting, investigating,
            tracking and responding to cybersecurity incidents.
          </p>

          <div className="feature-row">

            <div>
              <strong>🔐</strong>
              <span>Secure Authentication</span>
            </div>

            <div>
              <strong>🚨</strong>
              <span>Incident Tracking</span>
            </div>

            <div>
              <strong>📊</strong>
              <span>SOC Dashboard</span>
            </div>

          </div>

        </div>

      </div>

      <div className="auth-right">

        {!showRegister ? (

          <form
            className="auth-card"
            onSubmit={handleLogin}
          >

            <h2>Welcome Back</h2>

            <p className="subtitle">
              Sign in to your CyberGuard account
            </p>

            {message && (
              <div className="message">
                {message}
              </div>
            )}

            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  email: e.target.value,
                })
              }
              required
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  password: e.target.value,
                })
              }
              required
            />

            <button type="submit">
              Login
            </button>

            <p className="switch-text">
              Don't have an account?

              <span
                onClick={() => {
                  setShowRegister(true);
                  setMessage("");
                }}
              >
                Register
              </span>
            </p>

          </form>

        ) : (

          <form
            className="auth-card"
            onSubmit={handleRegister}
          >

            <h2>Create Account</h2>

            <p className="subtitle">
              Register for CyberGuard
            </p>

            {message && (
              <div className="message">
                {message}
              </div>
            )}

            <label>Name</label>

            <input
              type="text"
              placeholder="Enter your name"
              value={registerData.name}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  name: e.target.value,
                })
              }
              required
            />

            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  email: e.target.value,
                })
              }
              required
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Create a password"
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  password: e.target.value,
                })
              }
              required
            />

            <button type="submit">
              Create Account
            </button>

            <p className="switch-text">
              Already have an account?

              <span
                onClick={() => {
                  setShowRegister(false);
                  setMessage("");
                }}
              >
                Login
              </span>
            </p>

          </form>

        )}

      </div>

    </div>
  );
}

function Dashboard({ user, logout }) {

  const [dashboard, setDashboard] = useState(null);
  const [incidents, setIncidents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showReportForm, setShowReportForm] = useState(false);

  const [selectedIncident, setSelectedIncident] =
    useState(null);

  const [notes, setNotes] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [noteText, setNoteText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [detailLoading, setDetailLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const [reportData, setReportData] = useState({
    title: "",
    description: "",
    type: "PHISHING",
    severity: "LOW",
    riskScore: 25,
  });

  const [reportMessage, setReportMessage] = useState("");

  const loadData = async () => {

    try {

      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const dashboardResponse = await fetch(
        `${API}/api/dashboard`,
        { headers }
      );

      if (
        dashboardResponse.status === 401 ||
        dashboardResponse.status === 403
      ) {
        logout();
        return;
      }

      const dashboardData =
        await getJson(dashboardResponse);

      const incidentResponse = await fetch(
        `${API}/api/incidents`,
        { headers }
      );

      const incidentData =
        await getJson(incidentResponse);

      setDashboard(dashboardData);

      setIncidents(
        Array.isArray(incidentData)
          ? incidentData
          : []
      );

    } catch (error) {

      console.error(
        "Dashboard error:",
        error
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReportIncident = async (e) => {

    e.preventDefault();
    setReportMessage("");

    try {

      const token = localStorage.getItem("token");

      const params = new URLSearchParams();

      params.append(
        "title",
        reportData.title
      );

      params.append(
        "description",
        reportData.description
      );

      params.append(
        "type",
        reportData.type
      );

      params.append(
        "severity",
        reportData.severity
      );

      params.append(
        "riskScore",
        reportData.riskScore
      );

      params.append(
        "email",
        user.email
      );

      const response = await fetch(
        `${API}/api/incidents`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: params,
        }
      );

      const data = await getJson(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Failed to report incident"
        );
      }

      setReportMessage(
        "Incident reported successfully!"
      );

      setReportData({
        title: "",
        description: "",
        type: "PHISHING",
        severity: "LOW",
        riskScore: 25,
      });

      await loadData();

      setTimeout(() => {
        setShowReportForm(false);
        setReportMessage("");
      }, 1200);

    } catch (error) {

      setReportMessage(error.message);

    }
  };

  const openIncident = async (incident) => {

    setSelectedIncident(incident);

    setDetailLoading(true);
    setActionMessage("");

    try {

      const token = localStorage.getItem("token");

      const headers = {
        Authorization:
          `Bearer ${token}`,
      };

      const notesResponse = await fetch(
        `${API}/api/incidents/${incident.id}/notes`,
        { headers }
      );

      const evidenceResponse = await fetch(
        `${API}/api/incidents/${incident.id}/evidence`,
        { headers }
      );

      const notesData =
        await getJson(notesResponse);

      const evidenceData =
        await getJson(evidenceResponse);

      setNotes(
        Array.isArray(notesData)
          ? notesData
          : []
      );

      setEvidence(
        Array.isArray(evidenceData)
          ? evidenceData
          : []
      );

      if (
        user.role === "ANALYST" ||
        user.role === "ADMIN"
      ) {

        const auditResponse = await fetch(
          `${API}/api/audit-logs/incident/${incident.id}`,
          { headers }
        );

        if (auditResponse.ok) {

          const auditData =
            await getJson(auditResponse);

          setAuditLogs(
            Array.isArray(auditData)
              ? auditData
              : []
          );

        } else {

          setAuditLogs([]);

        }

      } else {

        setAuditLogs([]);

      }

    } catch (error) {

      console.error(
        "Incident details error:",
        error
      );

    } finally {

      setDetailLoading(false);

    }
  };

  const closeIncident = () => {

    setSelectedIncident(null);
    setNotes([]);
    setEvidence([]);
    setAuditLogs([]);
    setNoteText("");
    setSelectedFile(null);
    setActionMessage("");

  };

  const handleAddNote = async (e) => {

    e.preventDefault();

    if (!selectedIncident || !noteText.trim()) {
      return;
    }

    try {

      const token = localStorage.getItem("token");

      const params = new URLSearchParams();

      params.append(
        "note",
        noteText
      );

      params.append(
        "email",
        user.email
      );

      const response = await fetch(
        `${API}/api/incidents/${selectedIncident.id}/notes`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: params,
        }
      );

      const data = await getJson(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Failed to add note"
        );
      }

      setNotes([
        ...notes,
        data,
      ]);

      setNoteText("");

      setActionMessage(
        "Investigation note added."
      );

    } catch (error) {

      setActionMessage(
        error.message
      );

    }

  };

  const handleEvidenceUpload = async (e) => {

    e.preventDefault();

    if (!selectedIncident || !selectedFile) {
      setActionMessage(
        "Please select a file."
      );
      return;
    }

    try {

      const token = localStorage.getItem("token");

      const formData =
        new FormData();

      formData.append(
        "file",
        selectedFile
      );

      formData.append(
        "email",
        user.email
      );

      const response = await fetch(
        `${API}/api/incidents/${selectedIncident.id}/evidence`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data =
        await getJson(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Evidence upload failed"
        );
      }

      setEvidence([
        ...evidence,
        data,
      ]);

      setSelectedFile(null);

      e.target.reset();

      setActionMessage(
        "Evidence uploaded successfully."
      );

    } catch (error) {

      setActionMessage(
        error.message
      );

    }

  };

  const updateStatus = async (newStatus) => {

    if (!selectedIncident) {
      return;
    }

    try {

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API}/api/incidents/${selectedIncident.id}/status?status=${newStatus}`,
        {
          method: "PUT",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await getJson(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Status update failed"
        );
      }

      setSelectedIncident(data);

      setIncidents(
        incidents.map((incident) =>
          incident.id === data.id
            ? data
            : incident
        )
      );

      await loadData();

      setActionMessage(
        `Status changed to ${newStatus}.`
      );

      if (
        user.role === "ANALYST" ||
        user.role === "ADMIN"
      ) {

        const auditResponse = await fetch(
          `${API}/api/audit-logs/incident/${data.id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        if (auditResponse.ok) {

          const auditData =
            await getJson(auditResponse);

          setAuditLogs(
            Array.isArray(auditData)
              ? auditData
              : []
          );

        }

      }

    } catch (error) {

      setActionMessage(
        error.message
      );

    }
  };

  if (loading) {

    return (
      <div className="loading-screen">
        Loading CyberGuard...
      </div>
    );

  }

  return (
    <div className="dashboard-page">

      <header className="topbar">

        <div className="dashboard-brand">

          <span>🛡️</span>

          <div>
            <strong>
              CyberGuard
            </strong>

            <small>
              Security Operations Center
            </small>
          </div>

        </div>

        <div className="user-section">

          <div className="user-info">

            <strong>
              {user?.name}
            </strong>

            <span>
              {user?.role}
            </span>

          </div>

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>

      <main className="dashboard-content">

        <div className="welcome-section">

          <div>

            <span className="security-label">
              SECURITY OPERATIONS
            </span>

            <h1>
              Security Dashboard
            </h1>

            <p>
              Monitor and manage cybersecurity incidents
            </p>

          </div>

          <div className="role-badge">
            {user?.role}
          </div>

        </div>

        <div className="stats-grid">

          <StatCard
            icon="🚨"
            title="Total Incidents"
            value={
              dashboard?.totalIncidents || 0
            }
          />

          <StatCard
            icon="📋"
            title="Reported"
            value={
              dashboard?.reportedIncidents || 0
            }
          />

          <StatCard
            icon="🔎"
            title="Under Investigation"
            value={
              dashboard?.underInvestigation || 0
            }
          />

          <StatCard
            icon="✅"
            title="Resolved"
            value={
              dashboard?.resolvedIncidents || 0
            }
          />

          <StatCard
            icon="🔴"
            title="Critical"
            value={
              dashboard?.criticalIncidents || 0
            }
          />

          <StatCard
            icon="🟠"
            title="High Severity"
            value={
              dashboard?.highSeverityIncidents || 0
            }
          />

        </div>

        <div className="action-row">

          <button
            className="primary-action"
            onClick={() => {
              setShowReportForm(true);
              setReportMessage("");
            }}
          >
            + Report Incident
          </button>

          <button
            className="secondary-action"
            onClick={loadData}
          >
            ↻ Refresh
          </button>

        </div>

        {showReportForm && (

          <section className="report-section">

            <div className="section-header">

              <div>

                <h2>
                  Report Security Incident
                </h2>

                <p>
                  Submit a new cybersecurity incident
                </p>

              </div>

              <button
                className="close-btn"
                onClick={() => {
                  setShowReportForm(false);
                  setReportMessage("");
                }}
              >
                ✕
              </button>

            </div>

            <form
              className="report-form"
              onSubmit={handleReportIncident}
            >

              {reportMessage && (
                <div className="message">
                  {reportMessage}
                </div>
              )}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Incident Title
                  </label>

                  <input
                    type="text"
                    placeholder="Example: Suspicious phishing email"
                    value={reportData.title}
                    onChange={(e) =>
                      setReportData({
                        ...reportData,
                        title: e.target.value,
                      })
                    }
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Incident Type
                  </label>

                  <select
                    value={reportData.type}
                    onChange={(e) =>
                      setReportData({
                        ...reportData,
                        type: e.target.value,
                      })
                    }
                  >

                    <option value="PHISHING">
                      Phishing
                    </option>

                    <option value="MALWARE">
                      Malware
                    </option>

                    <option value="RANSOMWARE">
                      Ransomware
                    </option>

                    <option value="DATA_BREACH">
                      Data Breach
                    </option>

                    <option value="UNAUTHORIZED_ACCESS">
                      Unauthorized Access
                    </option>

                    <option value="DDOS">
                      DDoS
                    </option>

                    <option value="SOCIAL_ENGINEERING">
                      Social Engineering
                    </option>

                    <option value="OTHER">
                      Other
                    </option>

                  </select>

                </div>

              </div>

              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  rows="4"
                  placeholder="Describe what happened..."
                  value={reportData.description}
                  onChange={(e) =>
                    setReportData({
                      ...reportData,
                      description: e.target.value,
                    })
                  }
                  required
                />

              </div>

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Severity
                  </label>

                  <select
                    value={reportData.severity}
                    onChange={(e) =>
                      setReportData({
                        ...reportData,
                        severity: e.target.value,
                      })
                    }
                  >

                    <option value="LOW">
                      Low
                    </option>

                    <option value="MEDIUM">
                      Medium
                    </option>

                    <option value="HIGH">
                      High
                    </option>

                    <option value="CRITICAL">
                      Critical
                    </option>

                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Risk Score: {reportData.riskScore}
                  </label>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={reportData.riskScore}
                    onChange={(e) =>
                      setReportData({
                        ...reportData,
                        riskScore:
                          Number(e.target.value),
                      })
                    }
                  />

                </div>

              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => {
                    setShowReportForm(false);
                    setReportMessage("");
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-action"
                >
                  Submit Incident
                </button>

              </div>

            </form>

          </section>

        )}

        <section className="incident-section">

          <div className="section-header">

            <div>

              <h2>
                Recent Incidents
              </h2>

              <p>
                Click an incident to investigate
              </p>

            </div>

          </div>

          {incidents.length === 0 ? (

            <div className="empty-state">
              No incidents available.
            </div>

          ) : (

            <div className="table-container">

              <table>

                <thead>

                  <tr>
                    <th>ID</th>
                    <th>Incident</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Risk Score</th>
                  </tr>

                </thead>

                <tbody>

                  {incidents.map((incident) => (

                    <tr
                      key={incident.id}
                      onClick={() =>
                        openIncident(incident)
                      }
                      style={{
                        cursor: "pointer",
                      }}
                    >

                      <td>
                        #{incident.id}
                      </td>

                      <td>
                        <strong>
                          {incident.title}
                        </strong>
                      </td>

                      <td>
                        {incident.type}
                      </td>

                      <td>

                        <span
                          className={
                            `badge ${incident.severity.toLowerCase()}`
                          }
                        >
                          {incident.severity}
                        </span>

                      </td>

                      <td>

                        <span
                          className={
                            `status ${incident.status.toLowerCase()}`
                          }
                        >
                          {incident.status.replaceAll(
                            "_",
                            " "
                          )}
                        </span>

                      </td>

                      <td>
                        <strong>
                          {incident.riskScore}
                        </strong>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {selectedIncident && (

          <section className="report-section">

            <div className="section-header">

              <div>

                <span className="security-label">
                  INCIDENT INVESTIGATION
                </span>

                <h2>
                  #{selectedIncident.id}{" "}
                  {selectedIncident.title}
                </h2>

                <p>
                  {selectedIncident.description}
                </p>

              </div>

              <button
                className="close-btn"
                onClick={closeIncident}
              >
                ✕
              </button>

            </div>

            {detailLoading ? (

              <div className="empty-state">
                Loading incident details...
              </div>

            ) : (

              <div className="report-form">

                {actionMessage && (
                  <div className="message">
                    {actionMessage}
                  </div>
                )}

                <div className="stats-grid">

                  <StatCard
                    icon="⚠️"
                    title="Severity"
                    value={
                      selectedIncident.severity
                    }
                  />

                  <StatCard
                    icon="📈"
                    title="Risk Score"
                    value={
                      selectedIncident.riskScore
                    }
                  />

                  <StatCard
                    icon="🔄"
                    title="Status"
                    value={
                      selectedIncident.status
                    }
                  />

                  <StatCard
                    icon="👤"
                    title="Reported By"
                    value={
                      selectedIncident.reportedByName
                    }
                  />

                </div>

                {(user.role === "ANALYST" ||
                  user.role === "ADMIN") && (

                  <div className="form-group">

                    <label>
                      Update Incident Status
                    </label>

                    <select
                      value={
                        selectedIncident.status
                      }
                      onChange={(e) =>
                        updateStatus(
                          e.target.value
                        )
                      }
                    >

                      <option value="REPORTED">
                        REPORTED
                      </option>

                      <option value="TRIAGED">
                        TRIAGED
                      </option>

                      <option value="ASSIGNED">
                        ASSIGNED
                      </option>

                      <option value="UNDER_INVESTIGATION">
                        UNDER INVESTIGATION
                      </option>

                      <option value="CONTAINED">
                        CONTAINED
                      </option>

                      <option value="RESOLVED">
                        RESOLVED
                      </option>

                      <option value="CLOSED">
                        CLOSED
                      </option>

                    </select>

                  </div>

                )}

                <div className="form-row">

                  <div className="form-group">

                    <label>
                      Add Investigation Note
                    </label>

                    <form
                      onSubmit={handleAddNote}
                    >

                      <textarea
                        rows="4"
                        placeholder="Enter investigation findings..."
                        value={noteText}
                        onChange={(e) =>
                          setNoteText(
                            e.target.value
                          )
                        }
                      />

                      <button
                        type="submit"
                        className="primary-action"
                      >
                        Add Note
                      </button>

                    </form>

                  </div>

                  <div className="form-group">

                    <label>
                      Upload Evidence
                    </label>

                    <form
                      onSubmit={
                        handleEvidenceUpload
                      }
                    >

                      <input
                        type="file"
                        onChange={(e) =>
                          setSelectedFile(
                            e.target.files[0]
                          )
                        }
                      />

                      <br />
                      <br />

                      <button
                        type="submit"
                        className="primary-action"
                      >
                        Upload Evidence
                      </button>

                    </form>

                  </div>

                </div>

                <div className="form-row">

                  <div className="form-group">

                    <label>
                      Investigation Notes
                    </label>

                    {notes.length === 0 ? (

                      <div className="empty-state">
                        No investigation notes yet.
                      </div>

                    ) : (

                      notes.map((note) => (

                        <div
                          key={note.id}
                          className="message"
                        >

                          <strong>
                            {note.addedByName}
                          </strong>

                          <p>
                            {note.note}
                          </p>

                          <small>
                            {note.createdAt}
                          </small>

                        </div>

                      ))

                    )}

                  </div>

                  <div className="form-group">

                    <label>
                      Evidence
                    </label>

                    {evidence.length === 0 ? (

                      <div className="empty-state">
                        No evidence uploaded yet.
                      </div>

                    ) : (

                      evidence.map((item) => (

                        <div
                          key={item.id}
                          className="message"
                        >

                          <strong>
                            {item.fileName}
                          </strong>

                          <p>
                            Type:{" "}
                            {item.fileType}
                          </p>

                          <p>
                            Size:{" "}
                            {item.fileSize} bytes
                          </p>

                          <small>
                            SHA-256:
                            <br />
                            {item.sha256Hash}
                          </small>

                        </div>

                      ))

                    )}

                  </div>

                </div>

                {(user.role === "ANALYST" ||
                  user.role === "ADMIN") && (

                  <div className="form-group">

                    <label>
                      Audit Trail
                    </label>

                    {auditLogs.length === 0 ? (

                      <div className="empty-state">
                        No audit logs available.
                      </div>

                    ) : (

                      auditLogs.map((log) => (

                        <div
                          key={log.id}
                          className="message"
                        >

                          <strong>
                            {log.action}
                          </strong>

                          <p>
                            {log.details}
                          </p>

                          <small>
                            By:{" "}
                            {log.userName}
                            {" • "}
                            {log.createdAt}
                          </small>

                        </div>

                      ))

                    )}

                  </div>

                )}

              </div>

            )}

          </section>

        )}

      </main>

    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
}) {

  return (
    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div>

        <p>
          {title}
        </p>

        <h2>
          {value}
        </h2>

      </div>

    </div>
  );
}

export default App;