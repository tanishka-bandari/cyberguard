# Testing

CyberGuard has three layers of checks. CI runs the first two; the end-to-end suite is run by hand.

| Layer | Where | Runs in CI |
|-------|-------|-----------|
| Backend unit and integration tests (JUnit, H2 in memory) | `backend/src/test` | yes |
| Lint, type check and production build | `frontend/` | yes |
| Browser end-to-end tests (Playwright, real backend and MySQL) | `frontend/e2e` | no |

## Backend tests

```
cd backend
JAVA_HOME="C:\Program Files\Java\jdk-21.0.11" ./mvnw test      # Windows (use mvnw.cmd in cmd.exe)
./mvnw test                                                     # Linux and macOS with JDK 21
```

The tests use an in-memory H2 database, so MySQL is not needed.

## Frontend lint, type check and build

```
cd frontend
npm ci
npm run lint
npm run typecheck
BACKEND_URL=http://localhost:8080 npm run build
```

## End-to-end tests

### What you need

- JDK 21 (the backend does not build with a newer default JDK). On Windows the config looks for
  `C:\Program Files\Java\jdk-21.0.11`; set `E2E_JAVA_HOME` to use another JDK 21.
- MySQL on `localhost:3306` with user `root`, password `root` and an empty database named
  `cyberincident_e2e`. The `e2e` Spring profile recreates the schema on every start (`create-drop`)
  and seeds five accounts, so nothing in that database is precious.
- Playwright's Chromium: `npx playwright install chromium` (once).

### Running

```
cd frontend
npm run test:e2e                      # whole suite
npx playwright test auth              # one spec file
npx playwright test -g "drags a card" # one test by title
npm run test:e2e:screenshots          # documentation screenshots, see below
npx playwright show-report            # HTML report of the last run
```

`playwright.config.ts` starts both servers itself and stops them afterwards:

| Server | Port | How |
|--------|------|-----|
| Spring Boot, profile `e2e` | **8081** | `e2e/serve-backend.mjs` runs `mvnw spring-boot:run` with `SERVER_PORT=8081` and `CORS_ALLOWED_ORIGINS=http://localhost:3100` |
| Next.js production build | **3100** | `e2e/serve.mjs` runs `next build` with `BACKEND_URL=http://localhost:8081`, then `next start -p 3100` |

The ports are deliberately not 8080 and 3000, so the suite never touches a backend or dev server you
are using. The first start takes a couple of minutes (Maven plus a Next.js build). If a server is
already listening on its port it is reused, which makes repeat runs fast; in CI mode (`CI=1`) it is
never reused.

Because the build is made once at startup, a reused server on 3100 is **stale after you change
frontend code**. Stop it, or run `npm run build` with `BACKEND_URL=http://localhost:8081` and restart
`npx next start -p 3100`.

The seeded accounts all use the password `Passw0rd!e2e`:

| Account | Role |
|---------|------|
| `admin@cyberguard.test` | ADMIN |
| `analyst@cyberguard.test`, `analyst2@cyberguard.test` | ANALYST |
| `user@cyberguard.test`, `user2@cyberguard.test` | USER |

Specs create their own incidents through the API (`e2e/helpers.ts`, class `Api`) with titles such as
`E2E <name> <timestamp>`, and delete them again, so they do not depend on each other. The browser
fixture in `e2e/fixtures.ts` fails any test whose page logs an uncaught error or a console error.

### What each spec covers

| Spec | Covers |
|------|--------|
| `auth.spec.ts` | Each role lands on its home page; wrong password and empty form errors; registration (success, mismatch, duplicate email); sign out clears the session; deep link to login and back with `?next=`; open redirect ignored; role-based redirects (reporter to `/admin/triage`, analyst to `/admin/users`); forged and garbage tokens |
| `report.spec.ts` | Reporter wizard creates a high phishing incident with an evidence file, success screen, case appears as Reported; step validation; a second reporter cannot list or open the case |
| `incident-detail.spec.ts` | Admin creates an incident from the list and assigns it; analyst adds a note (persists after reload), uploads and downloads evidence (SHA-256 shown), resolves and closes, timeline entries; analysts see no Assign or Delete; reporter sees a read-only case |
| `triage.spec.ts` | Drag a card onto an analyst (assigned, under investigation) and into the Contained column; the keyboard path through the Actions dialog (assign, unassign); analysts cannot open the board |
| `admin.spec.ts` | Command center counts follow created and assigned incidents; role promotion and demotion on the Users page; an admin cannot change their own role; deleting an incident that has notes |
| `dashboard.spec.ts` | Severity filter updates the URL and table; clicking a chart bar sets a filter; KPI drill-down; theme toggle persists across reload |
| `portal-updates.spec.ts` | A reporter's open case page follows staff changes (assignment, resolution) without a reload, through the 20 second poll; overview lists open cases |
| `responsive.spec.ts` | No horizontal page overflow at 375, 768, 1280 and 1920 px on login, dashboard, incidents, report wizard and triage; the mobile drawer opens, navigates and closes |
| `screenshots.spec.ts` | Only with `SCREENSHOTS=1`, see below |

### Documentation screenshots

`npm run test:e2e:screenshots` (this sets `SCREENSHOTS=1`, which makes the config run only
`e2e/screenshots.spec.ts`) seeds ten varied incidents through the API, takes full-page screenshots and
writes them to `docs/screenshots/`: login (light and dark), reporter overview, report wizard,
dashboard (dark and light), incident detail, team, command center, triage board, users, and a 390x844
mobile dashboard. Desktop images are 1440x900. The seeded incidents are deleted afterwards.

### Troubleshooting

- **`JAVA_HOME` or "release version 21 not supported"**: Maven is running with a JDK other than 21.
  Set `E2E_JAVA_HOME` (or `JAVA_HOME`) to a JDK 21 directory.
- **MySQL errors on backend start** ("Access denied", "Unknown database", "Communications link
  failure"): check that MySQL is running, that `root` / `root` works, and that
  `CREATE DATABASE cyberincident_e2e;` has been run. Credentials live in
  `backend/src/main/resources/application-e2e.properties`.
- **"Port 8081 / 3100 is already used"** or tests hit old code: another process (often an earlier run
  that was interrupted) holds the port and is being reused. Find it with
  `netstat -ano | findstr :3100` (Windows) or `lsof -i :3100`, and stop that process. Never stop the
  process on 8080; it is not used by the suite.
- **Login fails with "Invalid email or password" in every test**: the backend rejected the browser's
  `Origin` header. Make sure it was started with `CORS_ALLOWED_ORIGINS=http://localhost:3100`
  (the config does this) and not by hand without it.
- **Web server start timeout**: the first start compiles the backend and builds the frontend. Run
  `npx playwright test` again, or start the servers yourself (below) and let Playwright reuse them.
- **Starting the servers by hand**:
  `cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=e2e` with `SERVER_PORT=8081` and
  `CORS_ALLOWED_ORIGINS=http://localhost:3100` set; then
  `cd frontend && BACKEND_URL=http://localhost:8081 npm run build && npx next start -p 3100`.
- **`npx playwright test` finishes the tests but never exits (Windows)**: Playwright stops the servers
  with `taskkill`, which must be on `PATH`. Some shells started from tools or IDEs lack
  `C:\Windows\System32`; add it (`export PATH="$PATH:/c/WINDOWS/System32"` in Git Bash) and rerun.
- **Failures leave screenshots and traces**: look in `frontend/test-results/` (ignored by git), and
  open `npx playwright show-report`. Traces are recorded on the first retry only.
