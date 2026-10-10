# CyberGuard frontend

The web application for CyberGuard: employees report incidents, analysts and administrators investigate, triage and track them.

Part of the [CyberGuard repository](../README.md). It talks to the REST API in [`../backend`](../backend/README.md).

## Tech stack

- Next.js 16 (App Router) and React 19, TypeScript
- Tailwind CSS 4 for styling, Material UI icons only
- SWR for data fetching, Recharts for charts
- Playwright for end-to-end tests

## Project structure

```
src/
  app/          pages and layouts (file-based routing)
  components/   UI by feature: ui, layout, auth, incidents, dashboard, admin, portal
  hooks/        data hooks built on SWR, session, filters, mutations
  lib/
    api/        the only code that calls the backend (one file per resource)
    auth/       session storage, route access rules, permission checks
    domain/     incident rules, labels, statistics, filters
  types/        API and domain types
e2e/            Playwright tests
```

## Pages

| Route | Who | Content |
|---|---|---|
| `/login`, `/register` | everyone | sign in and create an account |
| `/portal`, `/portal/report`, `/portal/cases`, `/portal/safety` | users | overview, 4-step report wizard, own cases, safety tips |
| `/dashboard`, `/incidents`, `/incidents/[id]`, `/team` | analysts, admins | filterable charts, incident list and detail, team workload |
| `/admin/command-center`, `/admin/triage`, `/admin/users` | admins | SLA overview, triage board, role management |

Each role is sent to its own home page after login, and pages for other roles redirect back.

## Run it locally

You need Node.js 24 and the backend running (see the [backend README](../backend/README.md)).

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000.

`BACKEND_URL` in `.env.local` is the address of the API (default `http://localhost:8080`). The app forwards every `/api/*` request to it, so the browser only ever talks to the frontend's own address and no CORS setup is needed. Next.js reads this value when the app is built or started, so restart after changing it.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | development server on port 3000 |
| `npm run build` | production build |
| `npm start` | serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run test:e2e` | Playwright end-to-end tests |

## End-to-end tests

The Playwright suite starts its own backend (port 8081, database `cyberincident_e2e`) and its own frontend (port 3100), so it does not disturb your normal setup. It needs a local MySQL. Details and troubleshooting are in [../docs/testing.md](../docs/testing.md).

## Deploy

The app is deployed on Vercel with the root directory set to `frontend` and one environment variable, `BACKEND_URL`. See [../docs/deployment.md](../docs/deployment.md).

## More documentation

- [User guide](../docs/user-guide.md): how each role uses the application
- [Architecture](../docs/architecture.md): routes, authentication flow, design decisions
