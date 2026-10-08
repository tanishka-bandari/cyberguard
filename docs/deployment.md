# Deployment guide (free hosting)

This guide takes you from "it works on my laptop" to a public website, using free plans only:

| Part | Service | What it hosts |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | The Next.js website |
| API | [Render](https://render.com) | The Spring Boot backend (runs from a Dockerfile) |
| Database | [Supabase](https://supabase.com) | PostgreSQL |

```
Browser  -->  Vercel (Next.js)  --/api/*-->  Render (Spring Boot)  -->  Supabase (PostgreSQL)
```

You deploy in this order, because each step needs a value from the one before: **database, then API, then frontend, then one setting back on the API.** Allow about an hour for the first time.

Before you start, you need:

- The code pushed to GitHub (`https://github.com/<you>/cyberguard`).
- A GitHub account to sign in to all three services (the easiest way).
- A notepad open. You will copy several values between the services.

> **Free plans change.** The limits below were checked in October 2026. If a screen looks different from the description, trust the service's own docs.

---

## Step 1: Create the database on Supabase

1. Go to supabase.com, choose **Start your project** and sign in with GitHub.
2. Click **New project**.
   - **Name:** `cyberguard`
   - **Database password:** create a strong password and **save it in your notepad**. You cannot read it again later (you can only reset it).
   - **Region:** choose the one closest to you. Remember it, because you should pick the same region on Render.
3. Wait for the project to finish setting up (about two minutes).
4. Click the **Connect** button at the top of the project page.
5. Choose the **Session pooler** connection method and note down three things:
   - the **host**, like `aws-0-eu-central-1.pooler.supabase.com`
   - the **port**: `5432`
   - the **user**, like `postgres.abcdefghijklmnop` (it contains your project reference)

   Use the **session pooler**, not the "direct connection". Render's free plan can only use IPv4, and the direct connection is IPv6-only.

6. Build your JDBC URL by putting the host into this template:

   ```
   jdbc:postgresql://HOST:5432/postgres?sslmode=require
   ```

   Example: `jdbc:postgresql://aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require`

You now have the three database values: `DATABASE_URL` (the JDBC URL above), `DB_USER` (the `postgres.xxxx` user) and `DB_PASSWORD` (your password). The tables are created automatically the first time the API starts, so there is nothing to import.

**Free plan limits:** 500 MB of database storage, and two free projects per account. Free projects can be paused after a period of inactivity; if the site stops working after a quiet week, open the Supabase dashboard and click **Restore project**.

---

## Step 2: Deploy the API on Render

1. Go to render.com and sign in with GitHub.
2. Click **New +**, then **Web Service**, and pick your `cyberguard` repository (give Render access to it when asked).
3. Fill in the form:

   | Field | Value |
   |---|---|
   | Name | `cyberguard-api` (this becomes part of your URL) |
   | Language | **Docker** |
   | Branch | `main` |
   | Region | The same area as your Supabase region |
   | Root Directory | `backend` |
   | Instance Type | **Free** |

   Render finds `backend/Dockerfile` by itself.

4. Open **Environment Variables** and add these:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | The JDBC URL from Step 1 |
   | `DB_USER` | The `postgres.xxxx` user from Step 1 |
   | `DB_PASSWORD` | Your Supabase database password |
   | `JWT_SECRET` | A long random string of at least 32 characters. Generate one with `openssl rand -base64 48`, or use any password generator. Never reuse a secret from a file in this repository. |
   | `CORS_ALLOWED_ORIGINS` | Put `http://localhost:3000` for now. You will change it in Step 4. |

5. Click **Create Web Service**. The first build takes several minutes (it downloads Maven dependencies). Watch the **Logs** tab. When you see `Started CyberincidentApplication`, the API is running.
6. Copy your API address from the top of the page, like `https://cyberguard-api.onrender.com`. This is your **API URL**.

**Quick check:** open `https://cyberguard-api.onrender.com/api/incidents` in your browser. Seeing `{"status":401,"message":...}` is a **success**: the API is alive and correctly refuses requests without a login.

> **Shortcut:** the repository contains a `render.yaml` file. Instead of the form above you can choose **New +, then Blueprint**, pick the repository, and Render pre-fills the service and generates `JWT_SECRET` for you. You still type the database values and `CORS_ALLOWED_ORIGINS` yourself.

---

## Step 3: Deploy the frontend on Vercel

1. Go to vercel.com and sign in with GitHub.
2. Click **Add New, then Project**, and import the `cyberguard` repository.
3. In the setup screen:

   | Field | Value |
   |---|---|
   | Framework Preset | **Next.js** (detected automatically) |
   | Root Directory | Click **Edit** and choose `frontend` |

4. Open **Environment Variables** and add:

   | Key | Value |
   |---|---|
   | `BACKEND_URL` | Your Render API URL from Step 2, with **no slash at the end**, like `https://cyberguard-api.onrender.com` |

5. Click **Deploy**. After about a minute you get your website address, like `https://cyberguard-yourname.vercel.app`. This is your **site URL**.

> If you ever change `BACKEND_URL`, you must **Redeploy** the project in Vercel (Deployments tab, three dots, Redeploy). The value is read when the site is built.

---

## Step 4: Tell the API which website may call it

Go back to Render, open your service, then **Environment**, and change:

| Key | Value |
|---|---|
| `CORS_ALLOWED_ORIGINS` | Your Vercel site URL, like `https://cyberguard-yourname.vercel.app` (no slash at the end) |

Click **Save**. Render restarts the service. If you later add a custom domain, add it here too, separated by a comma.

---

## Step 5: Create your first admin

Anyone who registers on the website becomes a normal **User**. The first administrator has to be promoted in the database, once.

1. Open your site URL and **register** with your own email.
2. In Supabase, open **SQL Editor**, then **New query**, and run:

   ```sql
   update users set role = 'ADMIN' where email = 'you@example.com';
   ```

   Use the email you just registered with.
3. On the website, **sign out and sign in again**. You now land on the admin command center. From the **Users** page you can promote other people to Analyst or Admin without touching the database again.

---

## Step 6: Lock down the database tables (do this once)

Supabase can expose tables over its own public web API. Your app does not use that API, so close it. In **SQL Editor**, run:

```sql
alter table public.users enable row level security;
alter table public.incidents enable row level security;
alter table public.investigation_notes enable row level security;
alter table public.evidence enable row level security;
alter table public.audit_logs enable row level security;

revoke all on table public.users, public.incidents, public.investigation_notes,
  public.evidence, public.audit_logs from anon, authenticated;
```

Your Spring Boot API keeps working, because it connects with the owner account, which is not affected by these rules. This only blocks the other, unused door.

---

## Step 7: Check that everything works

Open your site URL and go through this list:

- [ ] The login page loads in your browser.
- [ ] You can sign in with your admin account and see the command center.
- [ ] Report an incident (register a second account in a private window to act as a normal user).
- [ ] The incident appears in the admin's incident list.
- [ ] Add a note, and change the status.

---

## Things to know about the free plans

| Behaviour | Why it happens | What to do |
|---|---|---|
| The **first request after 15 minutes of silence takes about a minute** (the page may show "cannot reach the server") | Render puts free services to sleep when idle | Wait a minute and try again. Before a demo or presentation, open the site five minutes earlier to wake the API. |
| **Uploaded evidence files disappear** after a restart or a new deploy | Render's free plan has no permanent disk | Fine for a demo. The incident, notes and the file's record in the database stay; only the file itself is lost. A permanent fix needs a paid disk or file storage (for example Supabase Storage), which this project does not implement. |
| The API stops working at the end of the month | Free Render accounts get 750 instance-hours per month, shared by all free services | One service fits. Do not run several free services at once. |
| The site stops working after a quiet week | Free Supabase projects can be paused when unused | Open the Supabase dashboard and click **Restore project**. |
| Large evidence uploads (over a few MB) may fail on the deployed site | Vercel limits the size of requests passing through it. This has not been tested for this project. | Test with a small file first. The API itself accepts up to 10 MB. |

---

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| Render build fails with `COPY ... not found` or cannot find the Dockerfile | **Root Directory** is not set to `backend`. Fix it in the service settings and redeploy. |
| Render logs show `Could not resolve placeholder 'JWT_SECRET'` (or `DATABASE_URL`, `DB_USER`, `DB_PASSWORD`) | That environment variable is missing or misspelled in Render. Add it and the service restarts. |
| Logs show `The connection attempt failed` or `Network is unreachable` | You used the direct connection host. Use the **Session pooler** host from Step 1. |
| Logs show `password authentication failed` | Wrong `DB_PASSWORD`, or the user is missing the project reference. The user must look like `postgres.abcdefghijklmnop`. Reset the password in Supabase (Project Settings, Database) if unsure. |
| Logs show `MaxClientsInSessionMode` or too many connections | Too many connections for the free pooler. Add `DB_POOL_SIZE=3` on Render. |
| Login says the server cannot be reached | The API is asleep (wait a minute), or `BACKEND_URL` on Vercel is wrong or has a trailing slash. Fix it and **redeploy** the Vercel project. |
| Browser console shows a CORS error, or login fails with 403 | `CORS_ALLOWED_ORIGINS` on Render does not exactly match your Vercel URL (check `https`, spelling, no trailing slash). |
| You are signed out unexpectedly | Changing `JWT_SECRET` signs everyone out once. This is normal; sign in again. |
| Everything worked, then every login returns 401 | You changed the `JWT_SECRET`, or the database was reset. Sign in again; register again if the database was recreated. |

---

## Updating the site later

Push to the `main` branch on GitHub. Vercel and Render both redeploy automatically (Render takes a few minutes because it rebuilds the Docker image). The GitHub Actions workflow runs the tests on every push; keep an eye on its green tick.

## Security reminders

- Never commit `.env` files or paste real passwords into the repository. The repository only contains `.env.example` files with placeholders.
- The JWT secret that older versions of this project had in `application.properties` is public in the git history. Never use it; always set your own `JWT_SECRET`.
- Use a different password for the Supabase database than for anything else.

## Alternative: Railway (MySQL)

The backend also runs on MySQL. On Railway, set Root Directory to `/backend`, add a MySQL service, and set `DATABASE_URL` (a JDBC URL such as `jdbc:mysql://HOST:PORT/DATABASE?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`), `DB_USER` (or the older `MYSQLUSER`), `DB_PASSWORD` (or `MYSQLPASSWORD`), `JWT_SECRET` and `CORS_ALLOWED_ORIGINS`. The Vercel settings are the same as in Step 3.

## Local development

See the [README](../README.md#quick-start).
