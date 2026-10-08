# CyberGuard

[![CI](https://github.com/tanishka-bandari/cyberguard/actions/workflows/ci.yml/badge.svg)](https://github.com/tanishka-bandari/cyberguard/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

CyberGuard is a web application for reporting and managing cybersecurity incidents. Employees report incidents, analysts investigate them, and administrators triage, assign and track them against response-time targets (SLAs).

It is a bachelor's degree project: a Spring Boot REST API with a MySQL database, and a Next.js frontend.

## Screenshots

<!-- screenshots -->
<!-- /screenshots -->

## Features

| Role | What they can do |
|---|---|
| **User** (reporter) | Report an incident in a 4-step wizard, attach evidence, follow the status of their own cases, read safety tips for each incident type |
| **Analyst** | Dashboard with filterable charts and drill-down, incident list and detail, investigation notes, evidence upload and download, status changes, team workload view |
| **Admin** | Everything an analyst can do, plus the command center (SLA breaches, team performance), a drag-and-drop triage board with a keyboard alternative, assigning and deleting incidents, and managing user roles |

Other highlights:

- JWT authentication with role-based access enforced on the server
- Audit trail: incident creation, status changes, assignments, notes, evidence uploads and deletions are recorded
- Evidence files are stored with a SHA-256 hash and downloaded through an authenticated endpoint
- Global search (Ctrl/Cmd+K), filters kept in the URL, alerts for new and critical incidents while a staff member is signed in
- Light and dark themes, responsive from phone to desktop

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Material UI icons, Recharts, SWR |
| Backend | Spring Boot 4, Java 21, Spring Security, JPA/Hibernate, jjwt |
| Database | MySQL 8 or PostgreSQL (Supabase); H2 in memory for backend tests |
| Testing | JUnit and MockMvc (backend), Playwright (end to end) |
| CI/CD and hosting | GitHub Actions; Render (API), Supabase (database), Vercel (frontend) |

## Repository layout

```
backend/    Spring Boot API (controller, service, repository, model, dto, config)
frontend/   Next.js application (src/app routes, components, hooks, lib)
docs/       Architecture, database, API reference, deployment, testing and user guides
.github/    CI workflow
```

## Quick start

### Prerequisites

- JDK 21 (make sure `JAVA_HOME` points to it)
- Node.js 24 and npm
- MySQL 8

### 1. Database

```sql
CREATE DATABASE cyberincident;
```

### 2. Backend

```bash
cd backend
cp .env.example .env      # then edit the values, see below
./mvnw spring-boot:run    # on Windows cmd/PowerShell: .\mvnw.cmd spring-boot:run
```

The API starts on http://localhost:8080. `.env` needs `DATABASE_URL`, `DB_USER`, `DB_PASSWORD` and `JWT_SECRET` (at least 32 random characters, for example from `openssl rand -base64 48`). The application refuses to start without them. Optional: `CORS_ALLOWED_ORIGINS`, `UPLOAD_DIR`, `PORT`. Tables are created automatically on first start. All variables are described in the [API reference](docs/api.md#configuration).

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000. The frontend forwards `/api/*` to `BACKEND_URL` (default `http://localhost:8080`), so the browser never calls the API on another origin.

### 4. First admin account

Registration always creates a normal user. Register once in the app, then promote yourself in the database. After that you can manage roles from the **Users** page:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';
```

Sign out and in again to see the admin menu.

## Tests

```bash
cd backend && ./mvnw test                         # API tests, no MySQL needed
cd frontend && npm run lint && npm run typecheck  # static checks
cd frontend && npm run test:e2e                   # Playwright, needs MySQL
```

CI runs the backend tests and the frontend lint, type check and build on every push and pull request to `main`. See [docs/testing.md](docs/testing.md) for how the end-to-end suite starts its own backend and database.

## Documentation

- [User guide](docs/user-guide.md): how to use the application, by role
- [Architecture](docs/architecture.md): components, authentication flow, authorization matrix, incident lifecycle, design decisions and limitations
- [Database](docs/database.md): tables, relations, enums and how to reset the database
- [API reference](docs/api.md): endpoints, roles, response shapes and configuration
- [Deployment](docs/deployment.md): step-by-step free hosting with Vercel, Render and Supabase
- [Testing](docs/testing.md): test layers and how to run them
- [Contributing](CONTRIBUTING.md)

## Deployment

The frontend runs on Vercel, the API on Render and the database on Supabase, all on free plans. The only frontend setting is `BACKEND_URL`, the public URL of the API. A first-time, step-by-step walkthrough with a troubleshooting table is in [docs/deployment.md](docs/deployment.md). Free-tier limits you should know about (the API sleeps when idle, uploaded evidence files are not kept across restarts) are explained there.

## License

[MIT](LICENSE)
