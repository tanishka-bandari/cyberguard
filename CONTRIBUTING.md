# Contributing to CyberGuard

## Setup

Follow the quick start in the [README](README.md). You need JDK 21, Node 24 and MySQL 8.

## Workflow

1. Branch from `main`: `git switch -c feat/short-description`.
2. Keep changes small and focused. One concern per pull request.
3. Make sure checks pass locally before pushing:
   - Backend: `cd backend && ./mvnw test`
   - Frontend: `cd frontend && npm run lint && npm run typecheck && npm run build`
4. Open a pull request into `main`. CI runs the same checks.

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
- Never commit secrets. Copy `.env.example` files to `.env` and keep the real values local.
