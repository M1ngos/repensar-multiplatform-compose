# Network Architecture — Frontend to Backend

## Overview

The Repensar platform uses a **reverse proxy** built into the Next.js server to route all browser traffic to the FastAPI backend. The browser never holds a hardcoded backend address. Every device that can reach the Next.js server automatically reaches the backend too, with no extra configuration.

---

## The Problem This Solves

Without a proxy, the frontend JavaScript bundle must contain the backend address (e.g. `http://192.168.1.5:8000`) so the browser can call the API. This breaks in three common scenarios:

| Scenario | Why it breaks |
|---|---|
| Another device on the LAN | Their `localhost` is their own machine, not yours |
| Docker containers | Container networking uses service names, not host IPs |
| Production deployment | The backend may be on a private network, unreachable from the browser |

With the proxy, the browser always talks to the **same host it loaded the page from**. The Next.js server handles forwarding to the backend transparently.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  Device A (your laptop)                                         │
│                                                                 │
│   Browser                  Next.js server        FastAPI        │
│   ──────                   ──────────────        ───────        │
│   GET /volunteers    ──▶   rewrite rule    ──▶   /volunteers    │
│                            BACKEND_URL           :8000          │
│                            (127.0.0.1:8000)                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Device B (phone, tablet, other laptop on the same network)     │
│                                                                 │
│   Browser                    Next.js server      FastAPI        │
│   ──────                     (on Device A)       (on Device A)  │
│   GET /volunteers    ──▶     rewrite rule  ──▶   /volunteers    │
│   → 192.168.1.5:3000         BACKEND_URL         :8000          │
│                              (127.0.0.1:8000)                   │
└─────────────────────────────────────────────────────────────────┘
```

Device B never needs to know about `127.0.0.1:8000`. It only needs to reach `192.168.1.5:3000`.

---

## Request Lifecycle (step by step)

Every API call from the browser goes through four layers in order.

### 1. `lib/api/client.ts` — builds a relative URL

```ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
//                                                     ^^
//                   Empty string when NEXT_PUBLIC_API_URL is unset or blank

const url = `${API_BASE_URL}${endpoint}`;
// '' + '/volunteers' = '/volunteers'   ← relative URL
```

`NEXT_PUBLIC_API_URL` is intentionally left **empty** in `.env.local`. Because the code uses nullish coalescing (`??`) rather than logical OR (`||`), an empty string is kept as-is and never replaced by a fallback URL.

The browser receives `/volunteers` as a relative URL. It resolves it against the page origin — the same host and port the user is already on:

```
Page loaded from:  http://192.168.1.5:3000/pt/portal
API call to:       /volunteers
Resolved to:       http://192.168.1.5:3000/volunteers
```

The request goes to **Next.js**, not directly to the backend.

---

### 2. `src/middleware.ts` — locale handling (next-intl)

The `next-intl` middleware runs on every incoming request. Its job is to detect or inject the locale prefix on page navigation (e.g. `/portal` → `/pt/portal`).

Without the exclusion list, it would also intercept API calls like `/volunteers` and redirect them to `/pt/volunteers` — which is a non-existent page route, not an API path.

The matcher regex excludes all backend paths so `next-intl` never touches them:

```ts
matcher: '/((?!api|_next|auth|users|volunteers|projects|tasks|
             resources|reports|analytics|gamification|blog/|
             files|uploads|search|sync|notifications|newsletter|
             contact|.*\\..*).*)'
```

**Important detail — `blog/` vs `blog`:**  
The exclusion for blog is `blog/` (with trailing slash), not plain `blog`. This is intentional:

- `GET /blog` → NOT excluded → middleware runs → locale check → renders the blog page ✓  
- `GET /blog/posts` → excluded (starts with `blog/`) → goes to rewrites below ✓  

If `blog` (no slash) were in the exclusion list, navigating to `/blog` would bypass the locale middleware entirely and fall through to a rewrite that proxies it to the backend — which has no root `/blog` route and returns 404.

---

### 3. `next.config.ts` — reverse proxy rewrites

This is where the actual proxying happens. The `BACKEND_URL` variable is **server-side only** (no `NEXT_PUBLIC_` prefix) — it never appears in the JavaScript bundle sent to the browser.

```ts
const backendUrl = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000';

// Two rewrite rules per backend prefix:
backends.flatMap((prefix) => [
    // Rule A: root path  — GET /volunteers        → http://127.0.0.1:8000/volunteers
    { source: prefix,           destination: `${backendUrl}${prefix}` },
    // Rule B: nested paths — GET /volunteers/42  → http://127.0.0.1:8000/volunteers/42
    { source: `${prefix}/:path*`, destination: `${backendUrl}${prefix}/:path*` },
])
```

Rule A covers list-style API calls (`GET /volunteers`, `GET /projects?status=active`).  
Rule B covers resource-level calls (`GET /volunteers/42`, `PATCH /tasks/7/status`).

The rewrite executes **server-to-server** inside the Next.js process. The browser never sees the backend address. From the browser's perspective, its request to `http://192.168.1.5:3000/volunteers` returned a JSON response — it has no idea the response came from `http://127.0.0.1:8000`.

**Proxied route prefixes:**

| Prefix | Backend routes |
|---|---|
| `/auth` | Login, register, token refresh, OAuth |
| `/users` | User account management |
| `/volunteers` | Volunteer profiles, skills, hours |
| `/projects` | Project CRUD |
| `/tasks` | Task management |
| `/resources` | Resource management |
| `/reports` | CSV/JSON data exports |
| `/analytics` | Time-series dashboards |
| `/gamification` | Badges, points, leaderboards |
| `/blog` | Blog posts, categories, tags |
| `/blog/` | Blog API sub-paths only (see note above) |
| `/files` | File upload/management |
| `/uploads` | Static file serving (uploaded images) |
| `/search` | Full-text search |
| `/sync` | Offline-first sync |
| `/notifications` | SSE notification stream |
| `/newsletter` | Newsletter subscriptions |
| `/contact` | Contact form |
| `/api/v1` | Preferences API |

---

### 4. FastAPI backend — `app/main.py`

Two backend settings make the proxy work correctly.

**`redirect_slashes=False`**

By default, FastAPI issues a `307 Temporary Redirect` from `/volunteers` to `/volunteers/` when the route is defined as `@router.get("/")`. That redirect response goes back through Next.js to the browser, which then tries to follow:

```
Location: http://127.0.0.1:8000/volunteers/
```

This is the internal backend address — completely unreachable from the browser. With `redirect_slashes=False` the redirect never fires. All backend list routes are registered as `@router.get("")` (empty string, no trailing slash) to match the no-slash calls from the frontend.

**`StaticFiles` mount for `/uploads`**

```python
app.mount("/uploads", StaticFiles(directory=_uploads_dir), name="uploads")
```

Uploaded images are served directly by FastAPI at `/uploads/*`. The Next.js rewrite for `/uploads/:path*` forwards these requests, so an image URL like:

```
http://192.168.1.5:3000/uploads/profile/avatar.jpg
```

is silently forwarded to:

```
http://127.0.0.1:8000/uploads/profile/avatar.jpg
```

and served back to the browser. No CORS issues, no direct backend access required.

---

## Complete Trace: `POST /auth/login`

```
User on device at 192.168.1.5:3000 submits login form
│
│  JavaScript (lib/api/auth.ts):
│    apiClient.post('/auth/login', { email, password })
│    → url = '' + '/auth/login' = '/auth/login'
│    → fetch('http://192.168.1.5:3000/auth/login', { method: 'POST', ... })
│
▼
Next.js server receives: POST /auth/login
│
├─ Step 1: middleware.ts
│    path starts with 'auth' → EXCLUDED → skip locale handling
│
├─ Step 2: next.config.ts rewrites
│    source '/auth' matches Rule A for prefix '/auth'
│    destination: http://127.0.0.1:8000/auth
│    → but /auth/login matches Rule B: '/auth/:path*' where path* = 'login'
│    → destination: http://127.0.0.1:8000/auth/login
│    → Next.js makes server-to-server POST to http://127.0.0.1:8000/auth/login
│
▼
FastAPI receives: POST /auth/login
│
│  router: auth_enhanced.py → @router.post("/login")
│  validates credentials → issues JWT
│  returns: { access_token, refresh_token, expires_in }
│
▼
Next.js forwards FastAPI's response (200 JSON) back to browser
│
▼
Browser stores tokens in localStorage, redirects to portal
```

---

## Running on a Local Network

```bash
# Frontend — accessible from any device on your network
pnpm dev --hostname 0.0.0.0

# Backend — bound to all interfaces
# (127.0.0.1 is sufficient if Next.js and FastAPI are on the same machine)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Any device on the LAN opens `http://<your-machine-ip>:3000`. All API traffic is automatically proxied. No configuration changes are needed per device or per URL.

---

## Environment Variables

### Frontend — `webApp/.env.local`

| Variable | Example | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | _(empty)_ | Browser-visible API base URL. **Leave empty** to use relative URLs (proxied). Set to a full URL only to bypass the proxy entirely. |
| `BACKEND_URL` | `http://127.0.0.1:8000` | Server-side only. Address Next.js uses to forward proxied requests. Never sent to the browser. Change if the backend is on a different machine (e.g. `http://backend:8000` in Docker). |

### Backend — `.env`

| Variable | Example | Description |
|---|---|---|
| `FRONTEND_URL` | `http://localhost:3000` | Used for CORS headers and building email links. Must match the URL the browser uses to reach Next.js. |
| `CORS_ORIGINS` | `["http://localhost:3000"]` | JSON array of browser origins allowed to call the backend directly. Add every origin a browser might use (localhost, LAN IP, production domain). |

---

## Non-Proxied Setup (direct backend calls)

Set `NEXT_PUBLIC_API_URL` to the full backend address:

```env
NEXT_PUBLIC_API_URL=http://192.168.1.5:8000
```

The browser will call the backend directly, bypassing the Next.js proxy. Requirements:
- The backend must be reachable from the browser (correct IP, port open)
- CORS must allow the frontend origin in `CORS_ORIGINS`
- Google OAuth and any backend-generated absolute URLs must use the correct public backend address

This mode is useful when the backend has a public address (e.g. a remote staging server) and you want to test against it from local Next.js.
