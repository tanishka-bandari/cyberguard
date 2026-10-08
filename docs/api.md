# CyberGuard API

Base path: `/api`. All responses are JSON unless noted. Timestamps are UTC
`LocalDateTime` values without an offset (for example `2026-10-08T14:10:21.85`).

## Authentication

`POST /api/auth/login` returns a JWT valid for 24 hours. Send it on every other request:

```
Authorization: Bearer <token>
```

Roles: `USER` (reporter), `ANALYST` (staff), `ADMIN`. "Staff" below means ANALYST or ADMIN.
"Reporter" means the user who created the incident.

## Errors

Every error has the same shape:

```json
{ "status": 403, "message": "You do not have access to this incident" }
```

| Status | Meaning |
|--------|---------|
| 400 | Validation failed, unknown enum value, missing parameter, empty file |
| 401 | Missing, invalid or expired token, or wrong email/password on login |
| 403 | Authenticated, but the role or ownership rule denies the action |
| 404 | Incident, evidence or user not found |
| 409 | Email already registered |
| 413 | Upload larger than 10 MB |

## Endpoints

Parameters marked "form" are `application/x-www-form-urlencoded` (or query string);
"JSON" is an `application/json` body; "multipart" is `multipart/form-data`.

### Auth

| Method | Path | Params | Roles | Response |
|--------|------|--------|-------|----------|
| POST | `/api/auth/register` | form: `name` (2-100 chars), `email` (valid), `password` (8+ chars) | public | `User` (role is always USER) |
| POST | `/api/auth/login` | JSON: `email`, `password` | public | `LoginResponse` |

### Incidents

| Method | Path | Params | Roles | Response |
|--------|------|--------|-------|----------|
| GET | `/api/incidents` | none | any; USER sees own only, staff sees all | `Incident[]` |
| GET | `/api/incidents/user/{userId}` | path | staff | `Incident[]` |
| POST | `/api/incidents` | form: `title` (1-200), `description` (1-2000), `type`, `severity`, `riskScore` (0-100) | any | `Incident` |
| PUT | `/api/incidents/{id}/status` | form: `status` | staff | `Incident` |
| PUT | `/api/incidents/{id}/assign` | form: `userId` (must be ANALYST or ADMIN); sets status to UNDER_INVESTIGATION; 400 if the incident is RESOLVED or CLOSED (reopen it first) | ADMIN | `Incident` |
| PUT | `/api/incidents/{id}/unassign` | none; UNDER_INVESTIGATION returns to REPORTED | ADMIN | `Incident` |
| DELETE | `/api/incidents/{id}` | none; also removes its notes, evidence (rows and files) and audit entries | ADMIN | 204, no body |

### Notes

| Method | Path | Params | Roles | Response |
|--------|------|--------|-------|----------|
| GET | `/api/incidents/{id}/notes` | none | staff or reporter | `Note[]` |
| POST | `/api/incidents/{id}/notes` | form: `content` (1-2000) | staff | `Note` |

### Evidence

| Method | Path | Params | Roles | Response |
|--------|------|--------|-------|----------|
| GET | `/api/incidents/{id}/evidence` | none | staff or reporter | `Evidence[]` |
| POST | `/api/incidents/{id}/evidence` | multipart: `file` (max 10 MB) | staff or reporter | `Evidence` |
| GET | `/api/incidents/{id}/evidence/{evidenceId}/file` | none | staff or reporter | file bytes, `Content-Disposition: attachment` |

The file endpoint needs the Bearer header, so a browser must fetch it as a blob rather than
use a plain link. Files are stored under a generated UUID name; the original name is kept
in the database only.

### Audit log

| Method | Path | Params | Roles | Response |
|--------|------|--------|-------|----------|
| GET | `/api/audit-logs/incident/{id}` | none | staff or reporter | `AuditLog[]` (oldest first) |
| GET | `/api/audit-logs/recent` | query: `limit` (default 50, clamped to 1-200) | staff | `AuditLog[]` (newest first) |

Entries are written by the server; there is no endpoint to create them. Actions:
`INCIDENT_CREATED`, `STATUS_CHANGED`, `INCIDENT_ASSIGNED`, `INCIDENT_UNASSIGNED`,
`NOTE_ADDED`, `EVIDENCE_UPLOADED`, `INCIDENT_DELETED`. The delete entry has
`incidentId: null` and details `"#<id> <title>"`.

### Users

| Method | Path | Params | Roles | Response |
|--------|------|--------|-------|----------|
| GET | `/api/users/staff` | none | staff | `User[]` (ANALYST and ADMIN only) |
| GET | `/api/users` | none | ADMIN | `User[]` |
| PUT | `/api/users/{id}/role` | query or form: `role`; you cannot change your own role | ADMIN | `User` |

### Dashboard

| Method | Path | Params | Roles | Response |
|--------|------|--------|-------|----------|
| GET | `/api/dashboard` | none | staff | `{ totalIncidents, reportedIncidents, underInvestigation, resolvedIncidents, criticalIncidents, highSeverityIncidents }` |

## Response shapes

```
User          { id, name, email, role }
LoginResponse { token, id, name, email, role }
Incident      { id, title, description, type, severity, status, riskScore,
                reportedById, reportedByName, reportedByEmail,
                assignedToId, assignedToName, assignedToEmail, reportedAt }
Note          { id, note, incidentId, addedById, addedByName, addedByEmail, createdAt }
Evidence      { id, fileName, fileType, fileSize, sha256Hash, incidentId,
                uploadedById, uploadedByName, uploadedAt }
AuditLog      { id, action, details, userId, userName, userEmail, incidentId, createdAt }
```

Enums:

- `type`: PHISHING, MALWARE, RANSOMWARE, DATA_BREACH, UNAUTHORIZED_ACCESS, DDOS, SOCIAL_ENGINEERING, OTHER
- `severity`: LOW, MEDIUM, HIGH, CRITICAL
- `status`: REPORTED, TRIAGED, ASSIGNED, UNDER_INVESTIGATION, CONTAINED, RESOLVED, CLOSED
- `role`: USER, ANALYST, ADMIN

## Configuration

Set as environment variables (Render or Railway service variables) or in `backend/.env` for local
development. See `backend/.env.example`. The app refuses to start when a required value is missing.

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | yes | JDBC URL. MySQL (`jdbc:mysql://host:3306/cyberincident`) and PostgreSQL (`jdbc:postgresql://host:5432/postgres?sslmode=require`) are supported |
| `DB_USER` | yes | Database user (the older name `MYSQLUSER` also works) |
| `DB_PASSWORD` | yes | Database password (the older name `MYSQLPASSWORD` also works) |
| `JWT_SECRET` | yes | HMAC secret, at least 32 characters (`openssl rand -base64 48`) |
| `CORS_ALLOWED_ORIGINS` | no | Comma-separated browser origins, default `http://localhost:3000` |
| `UPLOAD_DIR` | no | Evidence directory, default `uploads/evidence` |
| `PORT` | no | HTTP port, default `8080` |
| `DB_POOL_SIZE` | no | Maximum database connections, default `5` (keeps free database tiers happy) |

Run the end-to-end profile with `./mvnw spring-boot:run -Dspring-boot.run.profiles=e2e`. It uses the
local database `cyberincident_e2e`, recreates the schema on every start and seeds five accounts
(see `DemoDataSeeder`). It must never be used outside local testing.
