import { useEffect, useRef, useState } from "react";
import "./App.css";

const API = "http://localhost:8080";

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
      const response = await fetch(
        `${API}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        }
      );

      const data = await getJson(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Login failed"
        );
      }

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );

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
      const formData =
        new URLSearchParams();

      formData.append(
        "name",
        registerData.name
      );

      formData.append(
        "email",
        registerData.email
      );

      formData.append(
        "password",
        registerData.password
      );

      const response = await fetch(
        `${API}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: formData,
        }
      );

      const data = await getJson(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Registration failed"
        );
      }

      setMessage(
        "Registration successful! Please login."
      );

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
            <p>
              Incident Reporting & Response
            </p>
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
            A centralized platform for reporting,
            investigating, tracking and responding
            to cybersecurity incidents.
          </p>

          <div className="feature-row">

            <div>
              <strong>🔐</strong>
              <span>
                Secure Authentication
              </span>
            </div>

            <div>
              <strong>🚨</strong>
              <span>
                Incident Tracking
              </span>
            </div>

            <div>
              <strong>📊</strong>
              <span>
                SOC Dashboard
              </span>
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

  const [dashboard, setDashboard] =
    useState(null);

  const [incidents, setIncidents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [incidentFilter, setIncidentFilter] =
    useState("ALL");

  const [sidebarSection, setSidebarSection] =
    useState("DASHBOARD");

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [showReportForm, setShowReportForm] =
    useState(false);

  const [selectedIncident, setSelectedIncident] =
    useState(null);

  const [notes, setNotes] =
    useState([]);

  const [evidence, setEvidence] =
    useState([]);

  const [auditLogs, setAuditLogs] =
    useState([]);

  const [noteText, setNoteText] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [detailLoading, setDetailLoading] =
    useState(false);

  const [actionMessage, setActionMessage] =
    useState("");

  const [reportData, setReportData] = useState({
    title: "",
    description: "",
    type: "PHISHING",
    severity: "LOW",
    riskScore: 25,
  });

  const [reportMessage, setReportMessage] =
    useState("");

  const [staffUsers, setStaffUsers] =
    useState([]);

  const [selectedAssignee, setSelectedAssignee] =
    useState("");

  const [assignmentLoading, setAssignmentLoading] =
    useState(false);

  const [assignmentMessage, setAssignmentMessage] =
    useState("");

  const [editMode, setEditMode] =
    useState(false);

  const [editData, setEditData] = useState({
    title: "",
    description: "",
    type: "PHISHING",
    severity: "LOW",
    riskScore: 0,
  });

  const [editMessage, setEditMessage] =
    useState("");

  const isStaff =
    user?.role === "ANALYST" ||
    user?.role === "ADMIN";

  const isAdmin =
    user?.role === "ADMIN";

  const matchesFilter = (
    incident,
    filter
  ) => {

    switch (filter) {

      case "REPORTED":
        return (
          incident.status === "REPORTED"
        );

      case "ASSIGNED":
        return Boolean(
          incident.assignedToId ??
          incident.assignedToName ??
          incident.assignedToEmail
        );

      case "IN_PROGRESS":
        return (
          incident.status ===
            "UNDER_INVESTIGATION" ||
          incident.status ===
            "IN_PROGRESS"
        );

      case "SOLVED":
        return (
          incident.status ===
            "RESOLVED" ||
          incident.status ===
            "CLOSED"
        );

      case "CRITICAL":
        return (
          incident.severity ===
          "CRITICAL"
        );

      case "MEDIUM":
        return incident.severity === "MEDIUM";

      case "NORMAL":
        return (
          incident.severity === "NORMAL" ||
          incident.severity === "LOW"
        );

      case "HIGH":
        return (
          incident.severity ===
          "HIGH"
        );

      case "ALL":
      default:
        return true;
    }
  };

  const filteredIncidents =
    incidents.filter((incident) =>
      matchesFilter(
        incident,
        incidentFilter
      )
    );

  const getCount = (filter) =>
    incidents.filter((incident) =>
      matchesFilter(
        incident,
        filter
      )
    ).length;

  const handleSidebarClick = (section) => {

    setSidebarSection(section);

    if (section === "DASHBOARD") {
      setIncidentFilter("ALL");
      setShowReportForm(false);
      return;
    }

    if (section === "ALL_INCIDENTS") {
      setIncidentFilter("ALL");
      setShowReportForm(false);
      return;
    }

    if (section === "MY_INCIDENTS") {
      setIncidentFilter("ALL");
      setShowReportForm(false);
      return;
    }

    if (section === "REPORT_INCIDENT") {
      setShowReportForm(true);
      return;
    }

    if (section === "EMPLOYEES") {
      setShowReportForm(false);
      setTimeout(() => {
        document.getElementById("employee-section")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
      return;
    }

    if (section === "WORKERS") {
      setShowReportForm(false);
      setTimeout(() => {
        document.getElementById("worker-section")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
      return;
    }

    if (
      section === "CRITICAL" ||
      section === "HIGH" ||
      section === "MEDIUM" ||
      section === "NORMAL" ||
      section === "REPORTED" ||
      section === "IN_PROGRESS" ||
      section === "SOLVED"
    ) {
      setIncidentFilter(section);
      setShowReportForm(false);
      return;
    }

    setShowReportForm(false);
  };

  const SidebarButton = ({ section, icon, label }) => (
    <button
      type="button"
      className={`sidebar-item ${
        sidebarSection === section ? "active" : ""
      }`}
      onClick={() => handleSidebarClick(section)}
    >
      <span className="sidebar-icon">{icon}</span>
      <span className="sidebar-label">{label}</span>
    </button>
  );

  const sidebarTitle =
    user?.role === "ADMIN"
      ? "ADMIN CONTROL"
      : user?.role === "ANALYST"
        ? "ANALYST"
        : "USER";

  const loadStaffUsers = async () => {

    if (!isAdmin) {
      return;
    }

    try {

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API}/api/users/staff`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        return;
      }

      const data =
        await getJson(response);

      setStaffUsers(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Staff users error:",
        error
      );

      setStaffUsers([]);

    }
  };

  const loadData = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const headers = {
        Authorization:
          `Bearer ${token}`,
      };

      const dashboardResponse =
        await fetch(
          `${API}/api/dashboard`,
          {
            headers,
          }
        );

      if (
        dashboardResponse.status === 401 ||
        dashboardResponse.status === 403
      ) {
        logout();
        return;
      }

      const dashboardData =
        await getJson(
          dashboardResponse
        );

      const incidentResponse =
        await fetch(
          `${API}/api/incidents`,
          {
            headers,
          }
        );

      if (
        incidentResponse.status === 401 ||
        incidentResponse.status === 403
      ) {
        logout();
        return;
      }

      const incidentData =
        await getJson(
          incidentResponse
        );

      setDashboard(
        dashboardData
      );

      const visibleIncidents =
        Array.isArray(incidentData)
          ? user?.role === "USER"
            ? incidentData.filter(
                (incident) =>
                  Number(
                    incident.reportedById
                  ) ===
                  Number(user.id)
              )
            : incidentData
          : [];

      setIncidents(
        visibleIncidents
      );

      if (isAdmin) {
        await loadStaffUsers();
      }

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
    // =========================================================
  // REPORT INCIDENT
  // =========================================================

  const handleReportIncident = async (e) => {
    e.preventDefault();
    setReportMessage("");

    try {
      const token =
        localStorage.getItem("token");

      const params =
        new URLSearchParams();

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

      const data =
        await getJson(response);

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
      setReportMessage(
        error.message
      );
    }
  };

  // =========================================================
  // OPEN INCIDENT
  // =========================================================

  const openIncident = async (incident) => {

    setSelectedIncident(incident);
    setDetailLoading(true);
    setActionMessage("");
    setAssignmentMessage("");
    setEditMessage("");
    setEditMode(false);

    setSelectedAssignee(
      incident.assignedToId
        ? String(incident.assignedToId)
        : ""
    );

    try {

      const token =
        localStorage.getItem("token");

      const headers = {
        Authorization:
          `Bearer ${token}`,
      };

      const notesResponse =
        await fetch(
          `${API}/api/incidents/${incident.id}/notes`,
          { headers }
        );

      const evidenceResponse =
        await fetch(
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

      if (isStaff) {

        const auditResponse =
          await fetch(
            `${API}/api/audit-logs/incident/${incident.id}`,
            { headers }
          );

        if (auditResponse.ok) {

          const auditData =
            await getJson(
              auditResponse
            );

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

  // =========================================================
  // CLOSE INCIDENT
  // =========================================================

  const closeIncident = () => {

    setSelectedIncident(null);
    setNotes([]);
    setEvidence([]);
    setAuditLogs([]);
    setNoteText("");
    setSelectedFile(null);
    setActionMessage("");
    setAssignmentMessage("");
    setSelectedAssignee("");
    setEditMode(false);
    setEditMessage("");

  };

  // =========================================================
  // EDIT INCIDENT
  // ANALYST + ADMIN
  // =========================================================

  const startEditIncident = () => {

    if (!selectedIncident) {
      return;
    }

    setEditData({
      title:
        selectedIncident.title || "",

      description:
        selectedIncident.description || "",

      type:
        selectedIncident.type ||
        "PHISHING",

      severity:
        selectedIncident.severity ||
        "LOW",

      riskScore:
        selectedIncident.riskScore || 0,
    });

    setEditMessage("");
    setEditMode(true);
  };

  const cancelEditIncident = () => {

    setEditMode(false);
    setEditMessage("");

  };

  const handleEditIncident = async (e) => {

    e.preventDefault();

    if (!isStaff) {
      return;
    }

    if (!selectedIncident) {
      return;
    }

    setEditMessage("");

    try {

      const token =
        localStorage.getItem("token");

      const params =
        new URLSearchParams();

      params.append(
        "title",
        editData.title
      );

      params.append(
        "description",
        editData.description
      );

      params.append(
        "type",
        editData.type
      );

      params.append(
        "severity",
        editData.severity
      );

      params.append(
        "riskScore",
        editData.riskScore
      );

      const response =
        await fetch(
          `${API}/api/incidents/${selectedIncident.id}`,
          {
            method: "PUT",
            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/x-www-form-urlencoded",
            },
            body: params,
          }
        );

      const data =
        await getJson(response);

      if (!response.ok) {

        throw new Error(
          data.message ||
          data.error ||
          "Failed to update incident"
        );

      }

      setSelectedIncident(data);

      setIncidents(
        incidents.map(
          (incident) =>
            incident.id === data.id
              ? data
              : incident
        )
      );

      setEditMode(false);

      setEditMessage(
        "Incident updated successfully."
      );

      setActionMessage(
        "Incident details updated successfully."
      );

      await loadData();

    } catch (error) {

      setEditMessage(
        error.message
      );

    }
  };

  // =========================================================
  // ASSIGN INCIDENT
  // ADMIN ONLY
  // =========================================================

  const assignIncident = async () => {

    if (!isAdmin) {
      setAssignmentMessage("Only Admin can assign incidents.");
      return;
    }

    if (
      !selectedIncident ||
      !selectedAssignee
    ) {

      setAssignmentMessage(
        "Please select an analyst."
      );

      return;
    }

    setAssignmentLoading(true);
    setAssignmentMessage("");

    try {

      const token =
        localStorage.getItem("token");

      const response =
        await fetch(
          `${API}/api/incidents/${selectedIncident.id}/assign?userId=${selectedAssignee}`,
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
          "Failed to assign incident"
        );

      }

      setSelectedIncident(data);

      setIncidents(
        incidents.map(
          (incident) =>
            incident.id === data.id
              ? data
              : incident
        )
      );

      setAssignmentMessage(
        `Incident assigned to ${
          data.assignedToName ||
          data.assignedToEmail ||
          "selected employee"
        }.`
      );

      await loadData();

    } catch (error) {

      setAssignmentMessage(
        error.message
      );

    } finally {

      setAssignmentLoading(false);

    }
  };

  // =========================================================
  // UNASSIGN INCIDENT
  // =========================================================

  const unassignIncident = async () => {

    if (!isAdmin) {
      setAssignmentMessage("Only Admin can unassign incidents.");
      return;
    }

    if (!selectedIncident) {
      return;
    }

    const confirmed =
      window.confirm(
        `Remove assignment from incident #${selectedIncident.id}?`
      );

    if (!confirmed) {
      return;
    }

    setAssignmentLoading(true);
    setAssignmentMessage("");

    try {

      const token =
        localStorage.getItem("token");

      const response =
        await fetch(
          `${API}/api/incidents/${selectedIncident.id}/unassign`,
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
          "Failed to remove assignment"
        );

      }

      setSelectedIncident(data);

      setIncidents(
        incidents.map(
          (incident) =>
            incident.id === data.id
              ? data
              : incident
        )
      );

      setSelectedAssignee("");

      setAssignmentMessage(
        "Incident assignment removed."
      );

      await loadData();

    } catch (error) {

      setAssignmentMessage(
        error.message
      );

    } finally {

      setAssignmentLoading(false);

    }
  };

  // =========================================================
  // ADD INVESTIGATION NOTE
  // =========================================================

  const handleAddNote = async (e) => {

    e.preventDefault();

    if (!isStaff) {
      return;
    }

    if (
      !selectedIncident ||
      !noteText.trim()
    ) {
      return;
    }

    try {

      const token =
        localStorage.getItem("token");

      const params =
        new URLSearchParams();

      params.append(
        "note",
        noteText
      );

      const response =
        await fetch(
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

      const data =
        await getJson(response);

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

  // =========================================================
  // EVIDENCE UPLOAD
  // =========================================================

  const handleEvidenceUpload =
    async (e) => {

      e.preventDefault();

      if (!isStaff) {
        return;
      }

      if (
        !selectedIncident ||
        !selectedFile
      ) {

        setActionMessage(
          "Please select a file."
        );

        return;
      }

      try {

        const token =
          localStorage.getItem("token");

        const formData =
          new FormData();

        formData.append(
          "file",
          selectedFile
        );

        const response =
          await fetch(
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

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const updateStatus = async (
    newStatus
  ) => {

    if (!isStaff) {
      return;
    }

    if (!selectedIncident) {
      return;
    }

    try {

      const token =
        localStorage.getItem("token");

      const response =
        await fetch(
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
        incidents.map(
          (incident) =>
            incident.id === data.id
              ? data
              : incident
        )
      );

      await loadData();

      setActionMessage(
        `Status changed to ${newStatus}.`
      );

      if (isStaff) {

        const auditResponse =
          await fetch(
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
            await getJson(
              auditResponse
            );

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

  // =========================================================
  // MARK SOLVED
  // =========================================================

  const markIncidentSolved =
    async () => {

      if (!selectedIncident) {
        return;
      }

      await updateStatus(
        "RESOLVED"
      );
    };

  // =========================================================
  // DELETE INCIDENT
  // ANALYST + ADMIN
  // =========================================================

  const deleteIncident =
    async () => {

      if (!isStaff) {
        return;
      }

      if (!selectedIncident) {
        return;
      }

      const confirmed =
        window.confirm(
          `Are you sure you want to delete incident #${selectedIncident.id}?`
        );

      if (!confirmed) {
        return;
      }

      try {

        const token =
          localStorage.getItem("token");

        const response =
          await fetch(
            `${API}/api/incidents/${selectedIncident.id}`,
            {
              method: "DELETE",
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
            "Failed to delete incident"
          );

        }

        setSelectedIncident(null);
        setNotes([]);
        setEvidence([]);
        setAuditLogs([]);
        setNoteText("");
        setSelectedFile(null);
        setActionMessage("");
        setEditMode(false);

        await loadData();

      } catch (error) {

        setActionMessage(
          error.message
        );

      }
    };

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {

    return (
      <div className="loading-screen">
        Loading CyberGuard...
      </div>
    );

  }

  // =========================================================
  // DASHBOARD UI STARTS IN PART 3
  // =========================================================
    return (
    <div className={`dashboard-page ${sidebarOpen ? "sidebar-visible" : "sidebar-collapsed"}`}>

      <aside className="cyber-sidebar">

        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🛡️</div>
          <div>
            <strong>CYBERGUARD</strong>
            <small>{sidebarTitle}</small>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>

        <nav className="sidebar-nav">
          <SidebarButton section="DASHBOARD" icon="▣" label="Dashboard" />

          {user?.role === "ADMIN" && (
            <>
              <SidebarButton section="EMPLOYEES" icon="👥" label="Employees" />
              <SidebarButton section="WORKERS" icon="👨‍💻" label="Workers" />
            </>
          )}

          {user?.role === "USER" ? (
            <>
              <SidebarButton section="MY_INCIDENTS" icon="📋" label="My Incidents" />
              <SidebarButton section="REPORT_INCIDENT" icon="➕" label="Report Incident" />
              <SidebarButton section="SOLVED" icon="✅" label="Solved" />
            </>
          ) : (
            <>
              <SidebarButton section="ALL_INCIDENTS" icon="🚨" label="All Incidents" />
              <div className="sidebar-divider" />
              <div className="sidebar-group-title">SEVERITY</div>
              <SidebarButton section="CRITICAL" icon="🔴" label="Critical" />
              <SidebarButton section="HIGH" icon="🟠" label="High" />
              <SidebarButton section="MEDIUM" icon="🟡" label="Medium" />
              <SidebarButton section="NORMAL" icon="🟢" label="Normal" />
              <div className="sidebar-divider" />
              <div className="sidebar-group-title">STATUS</div>
              <SidebarButton section="REPORTED" icon="📋" label="Reported" />
              <SidebarButton section="IN_PROGRESS" icon="🔎" label="In Progress" />
              <SidebarButton section="SOLVED" icon="✅" label="Solved" />
            </>
          )}
        </nav>

        <div className="sidebar-bottom">
          {user?.role === "ADMIN" && (
            <div className="sidebar-admin-status">
              <span>⚙</span>
              <span>Admin</span>
            </div>
          )}
          <button type="button" className="sidebar-logout" onClick={logout}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>

      </aside>

      <div className="dashboard-main-area">

      {/* =====================================================
          TOP BAR
      ====================================================== */}

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

        <div className="topbar-search">
          <span>⌕</span>
          <input aria-label="Search incidents" placeholder="Search incidents, users..." />
        </div>

        <div className="user-section">
          <button className="notification-btn" type="button" aria-label="Notifications">🔔<span className="notification-dot" /></button>
          <div className="avatar">{(user?.name || "A").charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <strong>{user?.name || "Admin"}</strong>
            <span>{user?.role || "ADMIN"}</span>
          </div>
          <div className="topbar-clock">{new Date().toLocaleDateString("en-IN", {weekday:"short", day:"2-digit", month:"short", year:"numeric"})}<b>{new Date().toLocaleTimeString("en-IN", {hour:"2-digit", minute:"2-digit"})}</b></div>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>

      </header>


      {/* =====================================================
          MAIN DASHBOARD
      ====================================================== */}

      <main className="dashboard-content">

        {/* ===================================================
            WELCOME
        ==================================================== */}

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


        {/* ===================================================
            STAT CARDS
        ==================================================== */}

        <div className="stats-grid">

          {/* TOTAL */}

          <button
            type="button"
            className={`stat-card ${
              incidentFilter === "ALL"
                ? "active-filter"
                : ""
            }`}
            onClick={() =>
              setIncidentFilter("ALL")
            }
          >

            <div className="stat-icon">
              🚨
            </div>

            <div>

              <p>
                Total Incidents
              </p>

              <h2>
                {getCount("ALL")}
              </h2>

              <span>
                View all incidents →
              </span>

            </div>

          </button>


          {/* REPORTED */}

          <button
            type="button"
            className={`stat-card ${
              incidentFilter === "REPORTED"
                ? "active-filter"
                : ""
            }`}
            onClick={() =>
              setIncidentFilter("REPORTED")
            }
          >

            <div className="stat-icon">
              📋
            </div>

            <div>

              <p>
                Reported
              </p>

              <h2>
                {getCount("REPORTED")}
              </h2>

              <span>
                Needs attention →
              </span>

            </div>

          </button>


          {/* ASSIGNED */}

          {isStaff && (

            <button
              type="button"
              className={`stat-card ${
                incidentFilter === "ASSIGNED"
                  ? "active-filter"
                  : ""
              }`}
              onClick={() =>
                setIncidentFilter(
                  "ASSIGNED"
                )
              }
            >

              <div className="stat-icon">
                👥
              </div>

              <div>

                <p>
                  Assigned
                </p>

                <h2>
                  {getCount("ASSIGNED")}
                </h2>

                <span>
                  Assigned cases →
                </span>

              </div>

            </button>

          )}


          {/* IN PROGRESS */}

          <button
            type="button"
            className={`stat-card ${
              incidentFilter === "IN_PROGRESS"
                ? "active-filter"
                : ""
            }`}
            onClick={() =>
              setIncidentFilter(
                "IN_PROGRESS"
              )
            }
          >

            <div className="stat-icon">
              🔎
            </div>

            <div>

              <p>
                In Progress
              </p>

              <h2>
                {getCount("IN_PROGRESS")}
              </h2>

              <span>
                Under investigation →
              </span>

            </div>

          </button>


          {/* SOLVED */}

          <button
            type="button"
            className={`stat-card ${
              incidentFilter === "SOLVED"
                ? "active-filter"
                : ""
            }`}
            onClick={() =>
              setIncidentFilter(
                "SOLVED"
              )
            }
          >

            <div className="stat-icon">
              ✅
            </div>

            <div>

              <p>
                Solved
              </p>

              <h2>
                {getCount("SOLVED")}
              </h2>

              <span>
                View resolved →
              </span>

            </div>

          </button>


          {/* EMPLOYEES */}

          {isAdmin && (

            <button
              type="button"
              className="stat-card"
              onClick={() => {
                document
                  .getElementById(
                    "employee-section"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >

              <div className="stat-icon">
                👨‍💻
              </div>

              <div>

                <p>
                  Employees
                </p>

                <h2>
                  {staffUsers.length}
                </h2>

                <span>
                  View employees →
                </span>

              </div>

            </button>

          )}


          {/* CRITICAL */}

          <button
            type="button"
            className={`stat-card ${
              incidentFilter === "CRITICAL"
                ? "active-filter"
                : ""
            }`}
            onClick={() =>
              setIncidentFilter(
                "CRITICAL"
              )
            }
          >

            <div className="stat-icon">
              🔴
            </div>

            <div>

              <p>
                Critical
              </p>

              <h2>
                {getCount("CRITICAL")}
              </h2>

              <span>
                Critical threats →
              </span>

            </div>

          </button>


          {/* HIGH */}

          <button
            type="button"
            className={`stat-card ${
              incidentFilter === "HIGH"
                ? "active-filter"
                : ""
            }`}
            onClick={() =>
              setIncidentFilter("HIGH")
            }
          >

            <div className="stat-icon">
              🟠
            </div>

            <div>

              <p>
                High Risk
              </p>

              <h2>
                {getCount("HIGH")}
              </h2>

              <span>
                High risk incidents →
              </span>

            </div>

          </button>

        </div>


        <SocOverview
          incidents={incidents}
          getCount={getCount}
          onOpenIncident={openIncident}
          sidebarFilter={incidentFilter}
        />


        {/* ===================================================
            REPORT INCIDENT BUTTON
        ==================================================== */}

        <div className="dashboard-actions">

          <button
            className="primary-btn"
            onClick={() => {
              setShowReportForm(
                !showReportForm
              );

              setReportMessage("");
            }}
          >
            🚨 Report New Incident
          </button>

        </div>


        {/* ===================================================
            REPORT FORM
        ==================================================== */}

        {showReportForm && (

          <section className="panel">

            <div className="panel-header">

              <div>

                <span className="security-label">
                  INCIDENT REPORTING
                </span>

                <h2>
                  Report Cybersecurity Incident
                </h2>

              </div>

              <button
                className="close-btn"
                onClick={() =>
                  setShowReportForm(false)
                }
              >
                ✕
              </button>

            </div>


            <form
              className="incident-form"
              onSubmit={
                handleReportIncident
              }
            >

              <div className="form-grid">

                <div>

                  <label>
                    Incident Title
                  </label>

                  <input
                    type="text"
                    value={
                      reportData.title
                    }
                    onChange={(e) =>
                      setReportData({
                        ...reportData,
                        title:
                          e.target.value,
                      })
                    }
                    placeholder="Enter incident title"
                    required
                  />

                </div>


                <div>

                  <label>
                    Incident Type
                  </label>

                  <select
                    value={
                      reportData.type
                    }
                    onChange={(e) =>
                      setReportData({
                        ...reportData,
                        type:
                          e.target.value,
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

                    <option value="OTHER">
                      Other
                    </option>

                  </select>

                </div>


                <div>

                  <label>
                    Severity
                  </label>

                  <select
                    value={
                      reportData.severity
                    }
                    onChange={(e) =>
                      setReportData({
                        ...reportData,
                        severity:
                          e.target.value,
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


                <div>

                  <label>
                    Risk Score
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={
                      reportData.riskScore
                    }
                    onChange={(e) =>
                      setReportData({
                        ...reportData,
                        riskScore:
                          e.target.value,
                      })
                    }
                  />

                </div>

              </div>


              <div>

                <label>
                  Description
                </label>

                <textarea
                  value={
                    reportData.description
                  }
                  onChange={(e) =>
                    setReportData({
                      ...reportData,
                      description:
                        e.target.value,
                    })
                  }
                  placeholder="Describe the incident..."
                  rows="5"
                  required
                />

              </div>


              {reportMessage && (

                <div className="message">
                  {reportMessage}
                </div>

              )}


              <button
                type="submit"
                className="primary-btn"
              >
                Submit Incident
              </button>

            </form>

          </section>

        )}


        {/* ===================================================
            INCIDENT LIST
        ==================================================== */}

        <section className="panel">

          <div className="panel-header">

            <div>

              <span className="security-label">
                INCIDENT MONITOR
              </span>

              <h2>
                {incidentFilter === "ALL"
                  ? "All Incidents"
                  : `${incidentFilter.replace(
                      "_",
                      " "
                    )} Incidents`}
              </h2>

            </div>

            <span className="incident-count">
              {filteredIncidents.length}
            </span>

          </div>


          {filteredIncidents.length === 0 ? (

            <div className="empty-state">

              <div>
                🛡️
              </div>

              <h3>
                No incidents found
              </h3>

              <p>
                There are no incidents matching
                the current filter.
              </p>

            </div>

          ) : (

            <div className="incident-list">

              {filteredIncidents.map(
                (incident) => (

                  <button
                    key={incident.id}
                    type="button"
                    className={`incident-card ${
                      incident.severity ===
                      "CRITICAL"
                        ? "critical-incident"
                        : ""
                    }`}
                    onClick={() =>
                      openIncident(
                        incident
                      )
                    }
                  >

                    <div className="incident-card-top">

                      <span className="incident-id">
                        #{incident.id}
                      </span>

                      <span
                        className={`severity-badge ${
                          (
                            incident.severity ||
                            ""
                          ).toLowerCase()
                        }`}
                      >
                        {incident.severity}
                      </span>

                    </div>


                    <h3>
                      {incident.title}
                    </h3>


                    <p>
                      {incident.description}
                    </p>


                    <div className="incident-meta">

                      <span>
                        Type:{" "}
                        {incident.type}
                      </span>

                      <span>
                        Status:{" "}
                        {incident.status}
                      </span>

                      {incident.assignedToName && (

                        <span>
                          👤{" "}
                          {incident.assignedToName}
                        </span>

                      )}

                    </div>


                    <div className="incident-card-footer">

                      <span>
                        Risk Score:{" "}
                        {incident.riskScore}
                      </span>

                      <span>
                        Open →
                      </span>

                    </div>

                  </button>

                )
              )}

            </div>

          )}

        </section>


        {/* ===================================================
            ADMIN EMPLOYEES + WORKERS
        ==================================================== */}

        {isAdmin && (
          <>
            {sidebarSection === "EMPLOYEES" && (
              <section
                id="employee-section"
                className="panel employee-management-panel"
              >
                <div className="panel-header">
                  <div>
                    <span className="security-label">
                      ADMIN CONTROL
                    </span>
                    <h2>👥 Employees</h2>
                    <p>Employee details and incident workload</p>
                  </div>

                  <span className="incident-count">
                    {staffUsers.filter(
                      (staff) => staff.role !== "ANALYST"
                    ).length}
                  </span>
                </div>

                {staffUsers.filter(
                  (staff) => staff.role !== "ANALYST"
                ).length === 0 ? (
                  <div className="empty-state">
                    <div>👥</div>
                    <h3>No employees found</h3>
                    <p>No employee records are currently available.</p>
                  </div>
                ) : (
                  <div className="employee-list">
                    {staffUsers
                      .filter((staff) => staff.role !== "ANALYST")
                      .map((employee) => {
                        const employeeIncidents = incidents.filter(
                          (incident) =>
                            incident.assignedToId === employee.id ||
                            incident.assignedToEmail === employee.email
                        );

                        const assignedCount = employeeIncidents.length;
                        const inProgressCount = employeeIncidents.filter(
                          (incident) =>
                            incident.status === "IN_PROGRESS" ||
                            incident.status === "UNDER_INVESTIGATION"
                        ).length;
                        const solvedCount = employeeIncidents.filter(
                          (incident) =>
                            incident.status === "SOLVED" ||
                            incident.status === "RESOLVED" ||
                            incident.status === "CLOSED"
                        ).length;

                        return (
                          <div
                            className="employee-card"
                            key={employee.id}
                          >
                            <div className="employee-avatar">👤</div>

                            <div className="employee-info">
                              <h3>{employee.name || "Unknown Employee"}</h3>
                              <p>{employee.email || "No email"}</p>
                              <span>
                                Role: {employee.role || "EMPLOYEE"}
                              </span>
                            </div>

                            <div className="employee-stats">
                              <div>
                                <strong>{assignedCount}</strong>
                                <span>Assigned</span>
                              </div>
                              <div>
                                <strong>{inProgressCount}</strong>
                                <span>In Progress</span>
                              </div>
                              <div>
                                <strong>{solvedCount}</strong>
                                <span>Solved</span>
                              </div>
                            </div>

                            <div className="employee-status">
                              {employee.status || "ACTIVE"}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </section>
            )}

            {sidebarSection === "WORKERS" && (
              <section
                id="worker-section"
                className="panel employee-management-panel"
              >
                <div className="panel-header">
                  <div>
                    <span className="security-label">
                      SECURITY OPERATIONS
                    </span>
                    <h2>👨‍💻 Security Workers</h2>
                    <p>Analysts and security staff workload</p>
                  </div>

                  <span className="incident-count">
                    {staffUsers.filter(
                      (staff) => staff.role === "ANALYST"
                    ).length}
                  </span>
                </div>

                {staffUsers.filter(
                  (staff) => staff.role === "ANALYST"
                ).length === 0 ? (
                  <div className="empty-state">
                    <div>👨‍💻</div>
                    <h3>No security workers found</h3>
                    <p>No analyst/security worker records are currently available.</p>
                  </div>
                ) : (
                  <div className="employee-list">
                    {staffUsers
                      .filter((staff) => staff.role === "ANALYST")
                      .map((worker) => {
                        const workerIncidents = incidents.filter(
                          (incident) =>
                            incident.assignedToId === worker.id ||
                            incident.assignedToEmail === worker.email
                        );

                        const assignedCount = workerIncidents.length;
                        const inProgressCount = workerIncidents.filter(
                          (incident) =>
                            incident.status === "IN_PROGRESS" ||
                            incident.status === "UNDER_INVESTIGATION"
                        ).length;
                        const solvedCount = workerIncidents.filter(
                          (incident) =>
                            incident.status === "SOLVED" ||
                            incident.status === "RESOLVED" ||
                            incident.status === "CLOSED"
                        ).length;

                        return (
                          <div
                            className="employee-card worker-card"
                            key={worker.id}
                          >
                            <div className="employee-avatar">👨‍💻</div>

                            <div className="employee-info">
                              <h3>{worker.name || "Security Worker"}</h3>
                              <p>{worker.email || "No email"}</p>
                              <span>
                                Role: {worker.role || "ANALYST"}
                              </span>
                            </div>

                            <div className="employee-stats">
                              <div>
                                <strong>{assignedCount}</strong>
                                <span>Assigned</span>
                              </div>
                              <div>
                                <strong>{inProgressCount}</strong>
                                <span>In Progress</span>
                              </div>
                              <div>
                                <strong>{solvedCount}</strong>
                                <span>Solved</span>
                              </div>
                            </div>

                            <div className="employee-status">
                              {worker.status || "ACTIVE"}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {/* ===================================================
            INCIDENT DETAILS
        ==================================================== */}

        {selectedIncident && (

          <div className="modal-overlay">

            <div className="incident-modal">

              <div className="modal-header">

                <div>

                  <span className="security-label">
                    INCIDENT #{selectedIncident.id}
                  </span>

                  <h2>
                    {selectedIncident.title}
                  </h2>

                </div>

                <button
                  className="close-btn"
                  onClick={
                    closeIncident
                  }
                >
                  ✕
                </button>

              </div>


              {detailLoading ? (

                <div className="loading-screen">
                  Loading incident details...
                </div>

              ) : (

                <div className="incident-detail">

                  <div className="detail-section">

                    <div className="detail-grid">

                      <div>
                        <span>
                          Type
                        </span>

                        <strong>
                          {selectedIncident.type}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Severity
                        </span>

                        <strong>
                          {selectedIncident.severity}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Status
                        </span>

                        <strong>
                          {selectedIncident.status}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Risk Score
                        </span>

                        <strong>
                          {selectedIncident.riskScore}
                        </strong>
                      </div>

                    </div>

                  </div>


                  <div className="detail-section">

                    <h3>
                      Description
                    </h3>

                    <p>
                      {selectedIncident.description}
                    </p>

                  </div>


                  {/* STAFF CONTROLS */}

                  {isStaff && (

                    <div className="detail-section">

                      <h3>
                        Incident Management
                      </h3>


                      <div className="action-row">

                        <button
                          className="secondary-btn"
                          onClick={
                            startEditIncident
                          }
                        >
                          ✏️ Edit
                        </button>


                        <button
                          className="secondary-btn"
                          onClick={() =>
                            updateStatus(
                              "UNDER_INVESTIGATION"
                            )
                          }
                        >
                          🔎 Investigate
                        </button>


                        <button
                          className="secondary-btn"
                          onClick={() =>
                            updateStatus(
                              "RESOLVED"
                            )
                          }
                        >
                          ✅ Resolve
                        </button>

                      </div>

                    </div>

                  )}


                  {/* EDIT FORM */}

                  {isStaff &&
                    editMode && (

                      <div className="detail-section">

                        <h3>
                          Edit Incident
                        </h3>

                        <form
                          className="incident-form"
                          onSubmit={
                            handleEditIncident
                          }
                        >

                          <label>
                            Title
                          </label>

                          <input
                            value={
                              editData.title
                            }
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                title:
                                  e.target.value,
                              })
                            }
                            required
                          />


                          <label>
                            Description
                          </label>

                          <textarea
                            rows="4"
                            value={
                              editData.description
                            }
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                description:
                                  e.target.value,
                              })
                            }
                            required
                          />


                          <div className="form-grid">

                            <div>

                              <label>
                                Type
                              </label>

                              <select
                                value={
                                  editData.type
                                }
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    type:
                                      e.target.value,
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

                                <option value="OTHER">
                                  Other
                                </option>

                              </select>

                            </div>


                            <div>

                              <label>
                                Severity
                              </label>

                              <select
                                value={
                                  editData.severity
                                }
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    severity:
                                      e.target.value,
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


                            <div>

                              <label>
                                Risk Score
                              </label>

                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={
                                  editData.riskScore
                                }
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    riskScore:
                                      e.target.value,
                                  })
                                }
                              />

                            </div>

                          </div>


                          {editMessage && (

                            <div className="message">
                              {editMessage}
                            </div>

                          )}


                          <div className="action-row">

                            <button
                              type="submit"
                              className="primary-btn"
                            >
                              Save Changes
                            </button>

                            <button
                              type="button"
                              className="secondary-btn"
                              onClick={
                                cancelEditIncident
                              }
                            >
                              Cancel
                            </button>

                          </div>

                        </form>

                      </div>

                    )}


                  {/* ASSIGNMENT */}

                  {isAdmin && (

                    <div className="detail-section">

                      <h3>
                        Analyst Assignment
                      </h3>

                      <div className="assignment-row">

                        <select
                          value={
                            selectedAssignee
                          }
                          onChange={(e) =>
                            setSelectedAssignee(
                              e.target.value
                            )
                          }
                        >

                          <option value="">
                            Select employee
                          </option>

                          {staffUsers
                            .filter((staff) => staff.role === "ANALYST")
                            .map((staff) => (

                              <option
                                key={staff.id}
                                value={staff.id}
                              >
                                {staff.name} -
                                {" "}
                                {staff.role}
                              </option>

                            )
                          )}

                        </select>


                        <button
                          className="primary-btn"
                          onClick={
                            assignIncident
                          }
                          disabled={
                            assignmentLoading
                          }
                        >
                          {assignmentLoading
                            ? "Assigning..."
                            : "Assign"}
                        </button>


                        {selectedIncident.assignedToId && (

                          <button
                            className="secondary-btn"
                            onClick={
                              unassignIncident
                            }
                            disabled={
                              assignmentLoading
                            }
                          >
                            Unassign
                          </button>

                        )}

                      </div>


                      {assignmentMessage && (

                        <div className="message">
                          {assignmentMessage}
                        </div>

                      )}

                    </div>

                  )}
                  {/* =================================================
                      NOTES
                  ================================================== */}

                  <div className="detail-section">

                    <div className="section-title-row">

                      <h3>
                        Investigation Notes
                      </h3>

                      <span>
                        {notes.length} notes
                      </span>

                    </div>


                    {isStaff && (

                      <div className="note-form">

                        <textarea
                          value={noteText}
                          onChange={(e) =>
                            setNoteText(
                              e.target.value
                            )
                          }
                          placeholder="Add investigation note..."
                          rows="3"
                        />

                        <button
                          className="primary-btn"
                          onClick={
                            handleAddNote
                          }
                          disabled={
                            !noteText.trim()
                          }
                        >
                          Add Note
                        </button>

                      </div>

                    )}


                    <div className="notes-list">

                      {notes.length === 0 ? (

                        <p className="muted-text">
                          No investigation notes yet.
                        </p>

                      ) : (

                        notes.map((note) => (

                          <div
                            className="note-card"
                            key={note.id}
                          >

                            <div className="note-header">

                              <strong>
                                {note.authorName ||
                                  note.createdByName ||
                                  "Security Analyst"}
                              </strong>

                              <span>
                                {note.createdAt
                                  ? new Date(
                                      note.createdAt
                                    ).toLocaleString()
                                  : ""}
                              </span>

                            </div>

                            <p>
                              {note.content ||
                                note.note ||
                                note.text}
                            </p>

                          </div>

                        ))

                      )}

                    </div>

                  </div>


                  {/* =================================================
                      EVIDENCE
                  ================================================== */}

                  <div className="detail-section">

                    <div className="section-title-row">

                      <h3>
                        Evidence
                      </h3>

                      <span>
                        🔐 Secured
                      </span>

                    </div>


                    {isStaff && (

                      <div className="evidence-upload">

                        <input
                          type="file"
                          id="evidence-file"
                          onChange={(e) =>
                            setSelectedFile(
                              e.target.files?.[0] ||
                              null
                            )
                          }
                        />

                        <button
                          className="primary-btn"
                          onClick={
                            handleEvidenceUpload
                          }
                          disabled={
                            !selectedFile
                          }
                        >
                          Upload Evidence
                        </button>

                      </div>

                    )}


                    {evidence.length === 0 ? (

                      <p className="muted-text">
                        No evidence uploaded.
                      </p>

                    ) : (

                      <div className="evidence-list">

                        {evidence.map(
                          (item) => (

                            <div
                              className="evidence-card"
                              key={item.id}
                            >

                              <div className="evidence-icon">
                                📁
                              </div>

                              <div>

                                <strong>
                                  {item.fileName ||
                                    item.name ||
                                    "Evidence File"}
                                </strong>

                                <span>
                                  {item.uploadedByName ||
                                    "Security Team"}
                                </span>

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    )}

                  </div>


                  {/* =================================================
                      AUDIT TRAIL
                  ================================================== */}

                  {isStaff && (

                    <div className="detail-section">

                      <div className="section-title-row">

                        <h3>
                          Audit Trail
                        </h3>

                        <span>
                          System activity
                        </span>

                      </div>


                      {auditLogs.length === 0 ? (

                        <p className="muted-text">
                          No audit activity available.
                        </p>

                      ) : (

                        <div className="audit-list">

                          {auditLogs.map(
                            (log, index) => (

                              <div
                                className="audit-item"
                                key={
                                  log.id ||
                                  index
                                }
                              >

                                <div className="audit-dot">
                                  ●
                                </div>

                                <div>

                                  <strong>
                                    {log.action ||
                                      log.event ||
                                      "System Event"}
                                  </strong>

                                  <p>
                                    {log.description ||
                                      log.message ||
                                      ""}
                                  </p>

                                  <span>
                                    {log.createdAt
                                      ? new Date(
                                          log.createdAt
                                        ).toLocaleString()
                                      : ""}
                                  </span>

                                </div>

                              </div>

                            )
                          )}

                        </div>

                      )}

                    </div>

                  )}


                  {/* =================================================
                      USER SOLVE BUTTON
                  ================================================== */}

                  {!isStaff &&
                    selectedIncident.status !==
                      "RESOLVED" &&
                    selectedIncident.status !==
                      "CLOSED" && (

                      <div className="detail-section">

                        <button
                          className="primary-btn"
                          onClick={
                            markIncidentSolved
                          }
                        >
                          ✅ Mark Incident as Solved
                        </button>

                      </div>

                    )}


                  {/* =================================================
                      DELETE
                  ================================================== */}

                  {isStaff && (

                    <div className="danger-zone">

                      <div>

                        <strong>
                          Danger Zone
                        </strong>

                        <p>
                          Permanently remove this
                          incident from the system.
                        </p>

                      </div>

                      <button
                        className="danger-btn"
                        onClick={
                          deleteIncident
                        }
                      >
                        🗑️ Delete Incident
                      </button>

                    </div>

                  )}

                </div>

              )}

            </div>

          </div>

        )}

      </main>


      {/* =====================================================
          TERMINAL FOOTER
      ====================================================== */}

      <footer className="terminal-footer">

        <div className="terminal-line">

          <span className="terminal-prompt">
            root@cyberguard:~$
          </span>

          <span>
            monitoring network traffic...
          </span>

          <span className="terminal-status">
            ● SYSTEM ONLINE
          </span>

        </div>

        <div className="terminal-line">

          <span>
            [SOC]
          </span>

          <span>
            Threat monitoring active
          </span>

          <span>
            Incidents: {incidents.length}
          </span>

          <span>
            Critical: {getCount("CRITICAL")}
          </span>

        </div>

      </footer>

      </div>

    </div>
  );
}



/* =========================================================
   SOC VISUAL OVERVIEW — LIVE SOC COMMAND CENTER
========================================================= */
function SocOverview({ incidents, getCount, onOpenIncident, sidebarFilter }) {
  const [packet, setPacket] = useState(0);
  const [logs, setLogs] = useState([
    "INFO  Perimeter scan initialized",
    "WARN  Suspicious packet detected",
    "INFO  Threat signatures synchronized",
    "INFO  Encrypted traffic inspection active",
    "INFO  Monitoring continuous...",
  ]);
  const [criticalPulse, setCriticalPulse] = useState(false);
  const [lastPacketTime, setLastPacketTime] = useState(new Date());
  const previousCritical = useRef(getCount("CRITICAL"));

  const total = getCount("ALL");
  const critical = getCount("CRITICAL");
  const high = getCount("HIGH");
  const medium = getCount("MEDIUM");
  const normal = getCount("NORMAL");
  const activeFilter = sidebarFilter || "ALL";

  const safeTotal = Math.max(total, 1);
  const criticalPct = Math.round((critical / safeTotal) * 100);
  const highPct = Math.round((high / safeTotal) * 100);
  const mediumPct = Math.round((medium / safeTotal) * 100);
  const normalPct = Math.max(0, 100 - criticalPct - highPct - mediumPct);

  useEffect(() => {
    const timer = setInterval(() => {
      setPacket((v) => (v + 1) % 8);
      setLastPacketTime(new Date());
      setLogs((old) => {
        const next = [
          `INFO  ${new Date().toLocaleTimeString()}  Network packet received`,
          "INFO  TLS traffic inspection complete",
          "WARN  Suspicious signature sweep complete",
          "INFO  Threat intelligence synchronized",
          "INFO  Monitoring continuous...",
          "INFO  Packet analysis complete",
        ];
        return [next[Math.floor(Math.random() * next.length)], ...old].slice(0, 5);
      });
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (critical > previousCritical.current) {
      setCriticalPulse(true);
      const timer = setTimeout(() => setCriticalPulse(false), 6500);
      previousCritical.current = critical;
      return () => clearTimeout(timer);
    }
    previousCritical.current = critical;
  }, [critical]);

  const filteredRecent = activeFilter === "ALL" || activeFilter === "DASHBOARD"
    ? [...incidents].slice(-5).reverse()
    : incidents.filter((item) => {
        if (["CRITICAL", "HIGH", "MEDIUM", "NORMAL"].includes(activeFilter)) {
          return activeFilter === "NORMAL"
            ? item.severity === "NORMAL" || item.severity === "LOW"
            : item.severity === activeFilter;
        }
        if (["REPORTED", "IN_PROGRESS", "SOLVED"].includes(activeFilter)) {
          return item.status === activeFilter ||
            (activeFilter === "IN_PROGRESS" && item.status === "UNDER_INVESTIGATION") ||
            (activeFilter === "SOLVED" && ["RESOLVED", "CLOSED"].includes(item.status));
        }
        return true;
      }).slice(-5).reverse();

  const overviewTitle =
    activeFilter === "ALL" || activeFilter === "DASHBOARD"
      ? "Threat Distribution"
      : `${activeFilter.replaceAll("_", " ")} Incidents`;

  return (
    <section className={`soc-overview-grid ${critical > 0 ? "has-critical" : "system-clear"}`}>
      <div className="soc-panel overview-panel">
        <div className="soc-panel-head">
          <div>
            <span className="security-label">INCIDENT OVERVIEW</span>
            <h2>{overviewTitle}</h2>
          </div>
          <span className="live-pill"><i /> LIVE FEED</span>
        </div>

        <div className="threat-summary-strip">
          <div><span>ACTIVE CASES</span><b>{total}</b></div>
          <div><span>CRITICAL RATE</span><b className={critical ? "danger-number" : "safe-number"}>{criticalPct}%</b></div>
          <div><span>RISK INDEX</span><b>{critical * 4 + high * 3 + medium * 2 + normal}</b></div>
        </div>

        <div className="overview-body">
          <div className="donut-wrap premium-donut-wrap">
            <div
              className="donut premium-donut"
              style={{
                background: `conic-gradient(#ff315f 0 ${criticalPct}%, #ff9f43 ${criticalPct}% ${criticalPct + highPct}%, #ffd23f ${criticalPct + highPct}% ${criticalPct + highPct + mediumPct}%, #18c998 ${criticalPct + highPct + mediumPct}% 100%)`,
              }}
            >
              <div className="donut-core">
                <strong>{total}</strong>
                <span>INCIDENTS</span>
              </div>
            </div>
            <div className="donut-orbit orbit-one" />
            <div className="donut-orbit orbit-two" />
          </div>

          <div className="legend-list premium-legend-list">
            <div className="legend-row critical-row">
              <i className="legend critical"/><span>Critical</span><b>{critical}</b><small>{criticalPct}%</small>
            </div>
            <div className="legend-row high-row">
              <i className="legend high"/><span>High</span><b>{high}</b><small>{highPct}%</small>
            </div>
            <div className="legend-row medium-row">
              <i className="legend medium"/><span>Medium</span><b>{medium}</b><small>{mediumPct}%</small>
            </div>
            <div className="legend-row normal-row">
              <i className="legend normal"/><span>Normal / Low</span><b>{normal}</b><small>{normalPct}%</small>
            </div>
          </div>
        </div>

        <div className="recent-table premium-recent-table">
          <div className="table-title">
            <span><i className="table-live-dot" /> {activeFilter === "ALL" || activeFilter === "DASHBOARD" ? "Recent Incidents" : `${activeFilter.replaceAll("_", " ")} Results`}</span>
            <span className="recent-count">{filteredRecent.length} visible</span>
          </div>
          {filteredRecent.length ? filteredRecent.map((item) => (
            <button className={`mini-incident ${item.severity === "CRITICAL" ? "mini-critical" : ""}`} key={item.id} onClick={() => onOpenIncident(item)}>
              <span>#{item.id}</span>
              <strong>{item.title}</strong>
              <em>{item.type}</em>
              <b className={`mini-severity ${(item.severity || "").toLowerCase()}`}>{item.severity || "NORMAL"}</b>
              <small>{item.status}</small>
            </button>
          )) : (
            <div className="empty-mini premium-empty">
              <span className="empty-crosshair">⌁</span>
              No matching incidents — perimeter monitoring remains active.
            </div>
          )}
        </div>
      </div>

      <div className="soc-panel network-panel">
        <div className="soc-panel-head">
          <div>
            <span className="security-label">LIVE NETWORK ACTIVITY</span>
            <h2>Global Activity</h2>
          </div>
          <span className="live-pill live-packets"><i /> PACKETS FLOWING</span>
        </div>

        <div className="network-status-line">
          <span><i /> PERIMETER ONLINE</span>
          <span>THREAT ENGINE <b>ACTIVE</b></span>
          <span>LATENCY <b>18ms</b></span>
        </div>

        <div className="network-map">
          <div className="map-grid" />
          <svg className="world-map-svg" viewBox="0 0 900 300" aria-hidden="true">
            <g className="map-continent">
              <path d="M105 83 L132 65 166 70 187 91 175 110 150 111 137 132 113 123 95 101Z" />
              <path d="M202 145 L231 131 254 146 249 166 264 191 252 226 230 246 214 220 221 191 205 170Z" />
              <path d="M410 78 L444 62 482 70 500 91 486 106 451 102 433 119 414 105Z" />
              <path d="M494 117 L535 111 568 130 589 158 578 185 551 178 534 158 510 153Z" />
              <path d="M646 104 L680 90 718 101 744 121 731 143 700 139 681 158 654 143Z" />
              <path d="M706 173 L741 168 768 190 756 213 727 214 709 198Z" />
            </g>
            <g className="map-routes">
              <path d="M151 104 Q335 28 470 91 T709 122" />
              <path d="M235 151 Q420 225 558 151 T744 193" />
              <path d="M425 91 Q482 125 550 155" />
            </g>
          </svg>

          <span className="node n1"/><span className="node n2"/><span className="node n3"/>
          <span className="node n4"/><span className="node n5"/>
          <span className="route r1"/><span className="route r2"/><span className="route r3"/>
          <div className={`packet p1 packet-${packet % 3}`} />
          <div className={`packet p2 packet-${(packet + 1) % 3}`} />
          <div className="packet-label">
            <b>INCOMING PACKET</b><br/>
            <span>192.168.1.45 → 103.21</span><br/>
            <em>TCP 443 / TLS</em>
          </div>
          <div className="network-scan-line" />
          <div className="map-legend">
            <span><i className="normal-dot"/> Normal</span>
            <span><i className="warn-dot"/> Suspicious</span>
            <span><i className="bad-dot"/> Malicious</span>
          </div>
        </div>

        <div className="activity-log">
          <div className="log-head">
            Network Activity Log <span>● LIVE · {String(packet + 24).padStart(2, "0")} PACKETS</span>
          </div>
          {logs.map((log, i) => (
            <div className={`log-line ${i === 1 ? "warn" : i === 3 ? "cyan" : ""}`} key={`${log}-${i}`}>
              <time>[{lastPacketTime.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit", second:"2-digit"})}]</time>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`critical-alert ${criticalPulse ? "critical-triggered" : "critical-idle"} ${critical > 0 ? "threat-active" : "threat-clear"}`}>
        <div className="alert-scan" />
        <div className="alert-radar"><span>!</span></div>
        <div className="critical-copy">
          <div className="critical-kicker">{critical > 0 ? "SECURITY EVENT // PRIORITY 01" : "SECURITY MONITOR // PERIMETER STATUS"}</div>
          <b>{critical > 0 ? (criticalPulse ? "CRITICAL INTRUSION DETECTED" : "CRITICAL THREAT ACTIVE") : "PERIMETER SECURE — NO CRITICAL INTRUSION"}</b>
          <span>{critical > 0 ? `${critical} critical incident${critical === 1 ? "" : "s"} require immediate SOC attention.` : "Threat sensors are watching every packet. Awaiting anomalous activity..."}</span>
        </div>
        <div className="critical-side-status">
          <strong>{critical > 0 ? "CRITICAL" : "MONITORING"}</strong>
          <small>{critical > 0 ? "RESPONSE REQUIRED" : "ALL SYSTEMS WATCHING"}</small>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   APP EXPORT
========================================================= */

export default App;