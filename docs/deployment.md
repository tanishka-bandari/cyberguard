# Deployment

CyberGuard runs as two separate services: the Spring Boot API on Railway (with a MySQL database) and the Next.js frontend on Vercel. The browser only talks to the frontend origin; Next.js forwards `/api/*` requests to the backend, so no CORS setup is needed for normal use.

```
Browser --> Vercel (Next.js) --/api/*--> Railway (Spring Boot) --> Railway MySQL
```

## Backend on Railway

1. Create a Railway project, add a **MySQL** service and a service from this GitHub repository.
2. In the backend service: **Settings -> Root Directory = `/backend`**.
3. Set these variables on the backend service:

| Variable | Value |
|---|---|
| `DATABASE_URL` | JDBC URL, for example `jdbc:mysql://HOST:PORT/DATABASE?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`. Railway's own `mysql://` URL will not work. |
| `MYSQLUSER` | Database user |
| `MYSQLPASSWORD` | Database password |
| `JWT_SECRET` | Random string of at least 32 characters. Generate with `openssl rand -base64 48`. |
| `CORS_ALLOWED_ORIGINS` | Your Vercel URL, for example `https://cyberguard.vercel.app` (comma-separate several) |
| `UPLOAD_DIR` | Optional. Where evidence files are stored. |

Railway sets `PORT` automatically. The application will not start if `JWT_SECRET`, `DATABASE_URL`, `MYSQLUSER` or `MYSQLPASSWORD` is missing.

**Evidence files:** Railway's disk is wiped on every deploy. To keep uploaded files, attach a Railway Volume, mount it (for example at `/data`) and set `UPLOAD_DIR=/data/evidence`.

## Frontend on Vercel

1. Import the repository into Vercel.
2. **Root Directory = `frontend`**, Framework Preset = **Next.js**. Clear any custom build or output directory left over from the old Vite setup.
3. Add the environment variable `BACKEND_URL=https://<your-railway-service>.up.railway.app` for Production and Preview.
4. Remove the old `VITE_API_URL` variable if it exists, then redeploy.

## First admin account

Self-registration always creates a `USER`. Promote your first admin directly in the database, once:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';
```

After that, admins can change roles from the **Users** page in the app.

## Rotating the JWT secret

Changing `JWT_SECRET` signs everyone out once; they simply log in again. Do this if the secret was ever committed or shared. The default secret that older versions of this repository shipped with is public in the git history and must not be used.

## Local development

See the [README](../README.md#quick-start).
