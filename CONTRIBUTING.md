# Contributing to CyberGuard

## Setup

Follow the quick start in the [README](README.md). You need JDK 21, Node 24 and MySQL 8. For a map of the code, read [docs/architecture.md](docs/architecture.md) first.

## Workflow

1. Branch from `main`: `git switch -c feat/short-description`.
2. Keep changes small and focused. One concern per pull request.
3. Make sure checks pass locally before pushing:
   - Backend: `cd backend && ./mvnw test`
   - Frontend: `cd frontend && npm run lint && npm run typecheck && npm run build`
   - End to end, when you change a user-facing flow: `cd frontend && npm run test:e2e` (needs MySQL, see [docs/testing.md](docs/testing.md))
4. Open a pull request into `main`. CI runs the backend tests and the frontend lint, type check and build; it does not run the Playwright suite.

## Tests and docs

- Add or update a test when you change behaviour, especially access rules: the backend tests in `backend/src/test` show how to call the API as each role.
- Keep the docs in step with the code. A new or changed endpoint goes into [docs/api.md](docs/api.md); a model change into [docs/database.md](docs/database.md); a new route or role rule into [docs/architecture.md](docs/architecture.md).
- A permission has to be changed in two places: the backend (`SecurityConfig` and `AccessControl`) and, for what the UI shows, `frontend/src/lib/auth/permissions.ts` and `access.ts`. The backend is the one that counts.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(incidents): add evidence download
fix(auth): return 401 for expired tokens
docs: update deployment guide
```

Types used here: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`.

## Code style

- Follow `.editorconfig` (2 spaces; 4 for Java).
- Comment only the non-obvious reason behind a decision, not what the code already says.
- Frontend: components do not call `fetch`; go through `src/lib/api`. Role checks go through `can()` in `src/lib/auth/permissions.ts`, and routes through the table in `src/lib/auth/access.ts`.
- Never commit secrets. Copy `.env.example` files to `.env` and keep the real values local.
