# CyberGuard backend

REST API for the CyberGuard incident reporting and management system. It handles login, role-based access, incidents, investigation notes, evidence files and the audit trail.

Part of the [CyberGuard repository](../README.md). The web application that uses this API is in [`../frontend`](../frontend/README.md).

## Tech stack

- Java 21, Spring Boot 4
- Spring Security with JWT (jjwt)
- Spring Data JPA / Hibernate
- MySQL 8 or PostgreSQL (for example Supabase); H2 in memory for tests
- Maven (wrapper included, no Maven install needed)

## Project structure

```
src/main/java/com/cyberguard/cyberincident/
  config/       security rules, JWT filter, demo data seeder (e2e profile only)
  controller/   REST endpoints: auth, incidents, notes, evidence, audit logs, users
  service/      business rules, access control, audit trail, JWT handling
  repository/   Spring Data JPA repositories
  model/        JPA entities and enums (Incident, User, Role, Severity, ...)
  dto/          request and response records
  exception/    one handler that turns errors into { status, message } JSON
src/main/resources/
  application.properties        configuration read from environment variables
  application-e2e.properties    local end-to-end test profile
src/test/java/                  MockMvc tests on an in-memory H2 database
Dockerfile                      used by Render to build and run the API
```

## Run it locally

You need JDK 21 and a database (MySQL 8 is the easiest locally).

1. Create the database: `CREATE DATABASE cyberincident;`
2. Create your settings file:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`. The values are described below. `.env` is ignored by git.
3. Start the API:
   ```bash
   ./mvnw spring-boot:run          # Windows: .\mvnw.cmd spring-boot:run
   ```
   If your default Java is not 21, point `JAVA_HOME` at a JDK 21 first.

The API listens on http://localhost:8080. The tables are created automatically on first start.

## Configuration

All settings are environment variables (or lines in `.env`). The application refuses to start if a required one is missing.

| Variable | Required | Meaning |
|---|---|---|
| `DATABASE_URL` | yes | JDBC URL, for example `jdbc:mysql://localhost:3306/cyberincident` or `jdbc:postgresql://HOST:5432/postgres?sslmode=require` |
| `DB_USER` | yes | Database user (`MYSQLUSER` also works) |
| `DB_PASSWORD` | yes | Database password (`MYSQLPASSWORD` also works) |
| `JWT_SECRET` | yes | Signing secret, at least 32 characters. Generate one with `openssl rand -base64 48` |
| `CORS_ALLOWED_ORIGINS` | no | Comma-separated browser origins, default `http://localhost:3000` |
| `UPLOAD_DIR` | no | Where evidence files are stored, default `uploads/evidence` |
| `PORT` | no | HTTP port, default `8080` |
| `DB_POOL_SIZE` | no | Maximum database connections, default `5` |

## Roles

| Role | Can do |
|---|---|
| `USER` | Report incidents, see own incidents, attach evidence to own incidents |
| `ANALYST` | Everything above for all incidents, plus change status and add notes |
| `ADMIN` | Everything above, plus assign, delete incidents and manage user roles |

Registration always creates a `USER`. To create the first admin, run once in the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';
```

## API overview

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Incidents | `GET/POST /api/incidents`, `PUT /api/incidents/{id}/status`, `/assign`, `/unassign`, `DELETE /api/incidents/{id}` |
| Notes | `GET/POST /api/incidents/{id}/notes` |
| Evidence | `GET/POST /api/incidents/{id}/evidence`, `GET /api/incidents/{id}/evidence/{evidenceId}/file` |
| Audit log | `GET /api/audit-logs/incident/{id}`, `GET /api/audit-logs/recent` |
| Users | `GET /api/users/staff`, `GET /api/users`, `PUT /api/users/{id}/role` |

Requests after login carry the header `Authorization: Bearer <token>`. Errors always come back as `{ "status": 400, "message": "..." }`. The full reference with parameters, roles and response shapes is in [../docs/api.md](../docs/api.md).

## Tests

```bash
./mvnw test
```

The tests use an in-memory H2 database, so neither MySQL nor any environment variable is needed. They cover login and registration, the incident life cycle, role and ownership rules, evidence handling and JWT validation.

## Deploy

The folder contains a `Dockerfile`. The step-by-step guide for Render and Supabase is in [../docs/deployment.md](../docs/deployment.md).

## More documentation

- [Architecture](../docs/architecture.md): layers, authentication flow, authorization matrix, status workflow
- [Database](../docs/database.md): tables, relations and enums
- [API reference](../docs/api.md)
