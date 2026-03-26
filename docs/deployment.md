# Deployment Guide — Vercel + Railway

## Overview

This guide covers deploying the Repensar platform:

- **Frontend** (Next.js 15) → [Vercel](https://vercel.com)
- **Backend** (FastAPI) → [Railway](https://railway.app)

### Architecture Diagram

```
User's Browser (any device, any IP)
  │
  │  HTTPS request to relative URL, e.g.:
  │    POST /auth/login
  │    GET  /volunteers/me
  │
  ▼
Vercel  (runs Next.js server)
  │  next.config.ts rewrites match route prefixes:
  │  /auth, /users, /volunteers, /projects, /tasks, /resources,
  │  /reports, /analytics, /gamification, /blog, /files, /uploads,
  │  /search, /sync, /notifications, /newsletter, /contact, /api/v1
  │
  │  Server-to-server proxy (BACKEND_URL env var)
  │    POST https://repensar-api.up.railway.app/auth/login
  │
  ▼
Railway  (runs FastAPI + PostgreSQL)
  │
  │  Reads DATABASE_URL, runs Alembic migrations on startup,
  │  serves the API
  ▼
PostgreSQL (Railway plugin)
```

### How the Proxy Works in Production

The Next.js proxy is **identical in production and local dev** — only the hostnames change:

| Environment | `BACKEND_URL` value             | What the browser sees |
|-------------|---------------------------------|-----------------------|
| Local dev   | `http://127.0.0.1:8000`         | `http://localhost:3000` |
| Production  | `https://repensar-api.up.railway.app` | `https://your-app.vercel.app` |

The rewrites in `next.config.ts` are server-side. Vercel executes them on its edge/serverless infrastructure. The Railway URL is never exposed to the browser.

**Key rules that MUST be followed:**
1. `NEXT_PUBLIC_API_URL` must be **empty** on Vercel (browser uses relative URLs).
2. `BACKEND_URL` must be the Railway public URL (Vercel server proxies to it).
3. `CORS_ORIGINS` on Railway must contain the **Vercel domain** (not user IPs).
4. Do NOT add rewrites to `vercel.json` — they are already in `next.config.ts`.

---

## Prerequisites

- [ ] **Railway account** — [railway.app](https://railway.app) (free tier available)
- [ ] **Vercel account** — [vercel.com](https://vercel.com) (free tier available)
- [ ] **Git repository** accessible by both Railway and Vercel
- [ ] (Optional) **S3-compatible storage** — AWS S3 or Cloudflare R2 for file uploads.
  Railway's filesystem is ephemeral; `STORAGE_BACKEND=local` loses files on every deploy.
- [ ] (Optional) **SMTP credentials** — for email verification, password reset, newsletters.
  SendGrid, Mailgun, AWS SES, or Postmark all work well.
- [ ] (Optional) **Redis** — for distributed rate limiting and logout-all-devices.
  Railway offers a managed Redis plugin.

---

## Step 1 — Deploy the Backend to Railway

### 1.1 — Create a Railway Project

1. Go to [railway.app](https://railway.app) → **New Project**.
2. Choose **Deploy from GitHub repo**.
3. Authorize Railway to access your repository.
4. Select the repository.

### 1.2 — Set the Root Directory

Railway needs to know that the backend is NOT at the repo root.

1. In your new service, go to **Settings → Source**.
2. Set **Root Directory** to:
   ```
   repensar-multiplatform-backend
   ```
3. Railway will now only watch that directory for changes.

### 1.3 — Add the PostgreSQL Plugin

1. In your Railway project, click **+ New** → **Database** → **Add PostgreSQL**.
2. Railway provisions a managed Postgres instance and automatically creates
   a `DATABASE_URL` variable on the Postgres service.
3. In your backend service's **Variables** tab, add:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```
   Railway resolves `${{Postgres.DATABASE_URL}}` at runtime to the actual connection string.
   This is a Railway Variable Reference — copy the syntax exactly.

### 1.4 — (Optional) Add the Redis Plugin

1. In your Railway project, click **+ New** → **Database** → **Add Redis**.
2. In your backend service's **Variables** tab, add:
   ```
   REDIS_URL=${{Redis.REDIS_URL}}
   ```

### 1.5 — Set Required Environment Variables

In your Railway backend service → **Variables** tab, add the following.
Reference `.env.production.example` for the full list with descriptions.

**Minimum required set:**

| Variable | Value |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `SECRET_KEY` | Generate: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `DEBUG` | `false` |
| `DISABLE_RATE_LIMITING` | `false` |
| `STORAGE_BACKEND` | `s3` (see Step 1.6) or `local` (dev only) |
| `FRONTEND_URL` | Your Vercel URL from Step 2 (add after Step 2) |
| `CORS_ORIGINS` | Your Vercel URL in JSON array (add after Step 2) |
| `BACKEND_URL` | Your Railway public domain (see Step 1.7) |

> **Tip:** You can set placeholder values for `FRONTEND_URL` and `CORS_ORIGINS`
> now and update them after Vercel assigns a domain in Step 2. You'll need to
> redeploy Railway after updating (Step 3 covers this).

### 1.6 — Configure File Storage

Railway's filesystem is **ephemeral** — it is wiped on every deploy. Files saved
locally (`STORAGE_BACKEND=local`) will be lost permanently on each redeploy.

**Option A — AWS S3 (recommended):**
1. Create an S3 bucket in AWS Console.
2. Create an IAM user with `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`
   permissions scoped to that bucket.
3. In Railway variables, set:
   ```
   STORAGE_BACKEND=s3
   S3_BUCKET=your-bucket-name
   S3_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...
   ```

**Option B — Cloudflare R2 (S3-compatible, generous free tier):**
1. Create an R2 bucket in the Cloudflare dashboard.
2. Create an R2 API token with "Object Read & Write" permissions.
3. In Railway variables, set:
   ```
   STORAGE_BACKEND=s3
   S3_BUCKET=your-r2-bucket-name
   S3_REGION=auto
   AWS_ACCESS_KEY_ID=<r2-access-key-id>
   AWS_SECRET_ACCESS_KEY=<r2-secret-access-key>
   ```
   You will also need to configure the S3 endpoint URL in `app/core/config.py`
   to point to `https://<account-id>.r2.cloudflarestorage.com` if not already done.

### 1.7 — Note the Railway Public Domain

1. In your Railway backend service, go to **Settings → Networking**.
2. Click **Generate Domain** (if not already generated).
3. Copy the public domain, e.g. `https://repensar-api.up.railway.app`.
4. Set this as `BACKEND_URL` in the backend service variables.
5. You will also need this URL for the Vercel `BACKEND_URL` variable in Step 2.

### 1.8 — First Deploy

Railway auto-deploys when you push to the connected branch. To trigger manually:

1. Go to your service → **Deployments** → **Deploy now**.
2. Railway runs `nixpacks.toml` to build the image (installs Python 3.11, `libmagic`, deps via `uv`).
3. The start command runs: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Alembic applies all pending migrations before the server starts.
5. Railway polls `GET /health` — the service becomes live when it returns `{"status": "healthy"}`.

**Verify the deploy:**
```
curl https://repensar-api.up.railway.app/health
# Expected: {"status": "healthy"}
```

---

## Step 2 — Deploy the Frontend to Vercel

### 2.1 — Import the Repository

1. Go to [vercel.com](https://vercel.com) → **Add New Project**.
2. Import from GitHub and select your repository.

### 2.2 — Set the Root Directory (Critical for Monorepo)

The `webApp/` directory contains the Next.js app, **not** the repo root.
If you skip this step, Vercel will look for `next.config.ts` in the wrong place
and the build will fail.

1. Under **Configure Project** → **Root Directory**, click **Edit**.
2. Set it to:
   ```
   repensar-multiplatform-compose/webApp
   ```
3. Vercel will now run all commands from inside that directory.

### 2.3 — Framework and Build Settings

Vercel auto-detects Next.js. Verify these settings match (or override them):

| Setting | Value |
|---|---|
| Framework Preset | **Next.js** |
| Root Directory | `repensar-multiplatform-compose/webApp` |
| Build Command | `pnpm build` (or override — see note below) |
| Output Directory | `.next` |
| Install Command | `pnpm install` |

These are also codified in `vercel.json` at the `webApp/` root.

> **Build Command override:** The default `pnpm build` runs `i18nexus pull && next build`.
> This requires `I18NEXUS_API_KEY` to be set. If you are not using i18nexus, override
> the Build Command in the Vercel dashboard to `pnpm next build` to skip the translation
> pull step.

### 2.4 — Set Environment Variables

In Vercel → **Settings → Environment Variables**, add:

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | *(leave blank — empty string)* | **Must be empty.** Proxy architecture requires relative URLs. |
| `BACKEND_URL` | `https://repensar-api.up.railway.app` | Railway public domain from Step 1.7 |
| `I18NEXUS_API_KEY` | `your-i18nexus-api-key` | Required for `pnpm build`; omit if using override build command |

**Important:** Set these for **Production**, **Preview**, and **Development**
environments as needed. At minimum, set them for **Production**.

### 2.5 — Deploy

1. Click **Deploy**.
2. Vercel runs `pnpm install` then `pnpm build`.
3. On success, Vercel assigns a domain, e.g. `https://repensar-multiplatform.vercel.app`.

**Verify the deploy:**
- Open the Vercel URL in your browser.
- Open the browser DevTools → Network tab.
- Try logging in — the `POST /auth/login` request should go to `https://your-app.vercel.app/auth/login`
  (NOT directly to Railway), confirming the proxy is working.

---

## Step 3 — Wire CORS (Required After Both Are Live)

After Vercel assigns a domain, you need to tell the Railway backend to accept
requests originating from that domain.

### 3.1 — Update Railway Environment Variables

In your Railway backend service → **Variables**, update or add:

```
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGINS=["https://your-app.vercel.app"]
BACKEND_URL=https://repensar-api.up.railway.app
```

If you have a **custom domain** on Vercel, add it too:
```
CORS_ORIGINS=["https://your-app.vercel.app", "https://your-custom-domain.com"]
```

### 3.2 — Trigger a Railway Redeploy

Variable changes in Railway do not automatically restart the service.
You must trigger a redeploy:

1. Railway service → **Deployments** → **Deploy now** (re-deploys latest build).
2. Or push a new commit to the connected branch.

### 3.3 — Verify CORS

Open your browser DevTools on the Vercel site and trigger an API call.
You should NOT see a `Cross-Origin Request Blocked` error. If you do, see
Troubleshooting below.

---

## Step 4 — Google OAuth (Optional)

If you're using Google Sign-In:

### 4.1 — Configure the Redirect URI

The `GOOGLE_REDIRECT_URI` must be reachable by Google after the user authenticates.
Since the Next.js proxy rewrites `/auth/:path*` to Railway, you can use either:

**Option A — Via Vercel proxy (recommended):**
```
GOOGLE_REDIRECT_URI=https://your-app.vercel.app/auth/google/callback
```
Add `https://your-app.vercel.app/auth/google/callback` to Google Cloud Console.

**Option B — Direct Railway URL:**
```
GOOGLE_REDIRECT_URI=https://repensar-api.up.railway.app/auth/google/callback
```
Add `https://repensar-api.up.railway.app/auth/google/callback` to Google Cloud Console.

### 4.2 — Update Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com).
2. APIs & Services → Credentials → your OAuth 2.0 client.
3. Under **Authorized redirect URIs**, add the URI from Step 4.1.
4. Save.

### 4.3 — Set Railway Variables

```
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
GOOGLE_REDIRECT_URI=https://your-app.vercel.app/auth/google/callback
```

Redeploy Railway after adding these.

---

## Updating

### Backend Updates (Railway)

```bash
git push origin main
```

Railway auto-deploys on push to the connected branch. The start command runs
`alembic upgrade head` before starting uvicorn, so **migrations are applied
automatically** on every deploy.

> **Migration safety:** Alembic runs in the same process as the app startup.
> If a migration fails, uvicorn does not start, Railway's health check fails,
> and the previous deployment remains active. This prevents a broken migration
> from taking down your API.

### Frontend Updates (Vercel)

```bash
git push origin main
```

Vercel auto-deploys on push. The new build runs `i18nexus pull && next build`
and replaces the previous deployment with zero downtime.

---

## Environment Variable Reference Summary

### Vercel (Frontend)

| Variable | Required | Value |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | *(empty string)* |
| `BACKEND_URL` | Yes | `https://repensar-api.up.railway.app` |
| `I18NEXUS_API_KEY` | Conditional | Required if using `pnpm build`; skip with `pnpm next build` |

### Railway (Backend) — Minimum Production Set

| Variable | Required | Example |
|---|---|---|
| `DATABASE_URL` | Yes | `${{Postgres.DATABASE_URL}}` |
| `SECRET_KEY` | Yes | 64-char hex string |
| `DEBUG` | Yes | `false` |
| `DISABLE_RATE_LIMITING` | Yes | `false` |
| `FRONTEND_URL` | Yes | `https://your-app.vercel.app` |
| `BACKEND_URL` | Yes | `https://repensar-api.up.railway.app` |
| `CORS_ORIGINS` | Yes | `["https://your-app.vercel.app"]` |
| `STORAGE_BACKEND` | Yes | `s3` |
| `S3_BUCKET` | If s3 | your bucket name |
| `S3_REGION` | If s3 | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | If s3 | your key ID |
| `AWS_SECRET_ACCESS_KEY` | If s3 | your secret key |

See `.env.production.example` in the backend directory for the complete reference
with descriptions for every variable.

---

## Troubleshooting

### Build fails on Vercel: `Error: I18NEXUS_API_KEY is required`

**Cause:** The `pnpm build` script runs `i18nexus pull` which requires the API key.

**Fix A:** Set `I18NEXUS_API_KEY` in Vercel environment variables.

**Fix B:** Override the Build Command in Vercel dashboard to:
```
pnpm next build
```
This skips `i18nexus pull` and uses the translation files already in the repo.

---

### API calls return 404 or hang

**Cause:** `BACKEND_URL` is not set, is empty, or points to the wrong host.

**Diagnosis:** In Railway logs, check if requests are arriving. In Vercel
function logs (Settings → Logs), look for rewrite errors.

**Fix:** Verify `BACKEND_URL` is set in Vercel environment variables and equals
the Railway public domain (e.g. `https://repensar-api.up.railway.app`).
After updating, trigger a Vercel redeploy (env var changes require a redeploy
to take effect on server-side code like rewrites).

---

### CORS error in browser: `Cross-Origin Request Blocked`

**Cause:** The Vercel domain is not in `CORS_ORIGINS` on the Railway backend.

**Fix:**
1. In Railway variables, set `CORS_ORIGINS=["https://your-app.vercel.app"]`.
2. Trigger a Railway redeploy.
3. Also verify `FRONTEND_URL` matches your Vercel domain.

> Note: With the proxy architecture, most API calls originate from Vercel's
> servers (not the browser), so CORS is only an issue for a small set of
> browser-direct calls (e.g. SSE streams, direct file downloads).

---

### File uploads are lost after redeploy

**Cause:** `STORAGE_BACKEND=local` on Railway. The container filesystem is
ephemeral — it is completely wiped and rebuilt on every deploy.

**Fix:** Switch to S3-compatible storage:
1. Create an S3 bucket (AWS or Cloudflare R2).
2. Set in Railway variables:
   ```
   STORAGE_BACKEND=s3
   S3_BUCKET=your-bucket
   S3_REGION=us-east-1
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   ```
3. Redeploy Railway.

---

### Database migrations fail on startup

**Symptom:** Railway deployment fails at `alembic upgrade head`. Health check
never passes. Previous deployment stays active (good — no downtime).

**Cause A:** `DATABASE_URL` not set or Railway Postgres plugin not attached.

**Fix:** Ensure the Postgres plugin is attached to the project and
`DATABASE_URL=${{Postgres.DATABASE_URL}}` is set in the backend service variables.

**Cause B:** A migration has a SQL error or conflicts with the existing schema.

**Fix:** Check Railway deployment logs for the Alembic error output. Fix the
migration file, commit, and push. Railway will re-run `alembic upgrade head`
on the next deploy.

---

### `MagicException: failed to find libmagic` on backend startup

**Cause:** `python-magic` requires the `libmagic` system library which is not
installed by default in the nixpacks build environment.

**Fix:** Ensure `nixpacks.toml` is present at the root of the backend directory
(`repensar-multiplatform-backend/nixpacks.toml`) and contains:
```toml
[phases.setup]
nixPkgs = ["python311", "file"]
```
The `file` nixpkg provides both the `file` CLI and the `libmagic.so` shared library.

If the error persists, add `"libmagic"` to the `nixPkgs` list as an explicit fallback:
```toml
nixPkgs = ["python311", "file", "libmagic"]
```

Commit the change and push to trigger a fresh Railway build.

---

### `pnpm: command not found` on Vercel

**Cause:** Vercel project root directory is set incorrectly (not to `webApp/`),
so `vercel.json` with `"installCommand": "pnpm install"` is not found, and
Vercel falls back to npm.

**Fix:** In Vercel → Settings → General → Root Directory, set it to
`repensar-multiplatform-compose/webApp` and redeploy.

---

### Google OAuth redirects to wrong URL after login

**Cause:** `GOOGLE_REDIRECT_URI` in Railway variables does not match the URI
registered in Google Cloud Console.

**Fix:**
1. Decide on one redirect URI (Vercel proxy or direct Railway).
2. Ensure the URI is listed under "Authorized redirect URIs" in Google Cloud Console.
3. Ensure `GOOGLE_REDIRECT_URI` in Railway variables matches exactly (no trailing slash).
4. Redeploy Railway after changing the variable.

---

### Railway deployment loops / restarts repeatedly

**Cause:** The health check at `GET /health` is failing. This can happen if:
- The app crashes on startup (migration failure, missing env var, import error)
- The app starts but is taking longer than `healthcheckTimeout` (60s) to respond

**Diagnosis:** Check Railway deployment logs for the startup error.

Common root causes and fixes:
- `SECRET_KEY` not set → set it in Railway variables
- `DATABASE_URL` not set → attach Postgres plugin and set the variable reference
- `libmagic` missing → check `nixpacks.toml` is present and correct
- App taking too long → increase `healthcheckTimeout` in `railway.json`
