# FINAL_PASS — Bug Hunt & Feature Verification

> Systematic test of every feature and entity relationship.
> Run top-to-bottom. Each section builds on the previous (data created in early sections is used in later ones).
> Mark each item ✅ PASS · ❌ FAIL (note the error) · ⚠️ SKIP (no test data yet).

---

## Setup

```bash
# Seed the database before starting
cd repensar-multiplatform-backend
DISABLE_RATE_LIMITING=true python scripts/seed_data.py

# Start both servers
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
cd ../repensar-multiplatform-compose/webApp && pnpm dev --hostname 0.0.0.0
```

**Test accounts to create/use:**

| Role | Email | Notes |
|---|---|---|
| Admin | admin@repensar.org | Create first via seed or API |
| Volunteer | volunteer@test.com | Register via UI |
| Project Manager | pm@test.com | Admin assigns role |
| Staff Member | staff@test.com | Admin assigns role |

---

## 1. Authentication

### 1.1 Registration
- [ ] Register new user → email verification sent
- [ ] Try registering with duplicate email → clear error shown
- [ ] Access `/portal` without verifying email → blocked or warned
- [ ] Click verification link in email → account activated
- [ ] **Bug check**: Volunteer profile auto-created on registration (`/volunteers/me` returns data)

### 1.2 Login
- [ ] Login with correct credentials → JWT stored in `localStorage.access_token`
- [ ] Login with wrong password → error message (not raw 500)
- [ ] Login with unverified email → clear error (not 500)
- [ ] After 5 failed attempts → account locked, clear lockout message
- [ ] **Bug check**: `localStorage.getItem('access_token')` (underscore) NOT `'accessToken'`

### 1.3 Token refresh
- [ ] Wait 30 min (or manipulate expiry in localStorage) → next API call auto-refreshes token silently
- [ ] Delete `refresh_token` from localStorage → redirected to login

### 1.4 Password reset
- [ ] Request reset for valid email → email received
- [ ] Request reset for unknown email → no 500 (silent success or clear message)
- [ ] Use reset link → password changed, old session invalidated

### 1.5 Google OAuth
- [ ] "Sign in with Google" button visible on login page
- [ ] Clicking → redirects to Google consent screen
- [ ] After Google consent → returns to app, logged in, volunteer profile exists
- [ ] **Bug check**: `GOOGLE_REDIRECT_URI` in backend `.env` must match Google Console redirect URI exactly

### 1.6 Session management
- [ ] Logout → tokens cleared, redirected to login, `/portal` blocked
- [ ] "Logout all devices" → all other sessions invalidated

---

## 2. Onboarding (Volunteer)

- [ ] New volunteer logs in → onboarding wizard auto-appears (not yet `onboarding_completed`)
- [ ] Welcome screen (step 0) renders `DialogTitle` (no console accessibility warning)
- [ ] Clicking "Do this later" → wizard dismissed, cooldown set (won't reappear for 24h)
- [ ] Each "Next" click → **PATCH `/volunteers/{id}/onboarding`** called immediately (check Network tab)
- [ ] If browser closed mid-wizard → re-opening shows progress saved (per-step persistence)
- [ ] Complete all 6 steps → `onboarding_completed = true`, wizard doesn't reappear
- [ ] **Bug check**: Gender step uses `<ToggleGroup>` (not raw `<button>` elements)
- [ ] **Bug check**: Motivation step uses shadcn `<Textarea>` (not raw `<textarea>`)

---

## 3. Volunteer — My Tasks

### 3.1 Page loads
- [ ] `GET /volunteers/{id}/tasks` returns tasks (not 404 or 500)
- [ ] Status tabs (All / Not Started / In Progress / Completed) filter correctly
- [ ] "?" tour button triggers driver.js walkthrough
- [ ] Empty state shows helpful message + link to Available Tasks

### 3.2 Task card interactions
- [ ] "Start Task" button → status changes to `in_progress`, timer starts
- [ ] Timer displays elapsed time, increments in UI
- [ ] Timer auto-pauses after 60 min of inactivity (AUTO_PAUSE_MS)
- [ ] "Pause" → timer shows accumulated time; "Resume" → continues
- [ ] **Bug check**: Timer state stored in `localStorage` key `task_session_{id}` — survives page refresh
- [ ] "Mark Complete" → confirmation dialog with timer summary → task completed
- [ ] On complete: time log submitted for approval, hours show in My Hours as "Pending"

### 3.3 Task detail
- [ ] Clicking "View Details" → `/portal/tasks/{task_id}` loads (not a 404)
- [ ] Back button returns to My Tasks
- [ ] Task description, subtasks, dependencies visible

---

## 4. Volunteer — Available Tasks

- [ ] `GET /tasks?suitable_for_volunteers=true` returns tasks (not 500)
- [ ] Project filter → filters by project name
- [ ] Skill filter → appears when tasks have `required_skills` data; filters correctly
- [ ] **Bug check**: Skill filter only shown when `allSkills.length > 0` (no empty dropdown)
- [ ] "Clear all filters" button resets all 3 filters (search + project + skill)
- [ ] "Sign Up" → confirmation dialog → `POST /tasks/{id}/assign` → success toast
- [ ] Already signed-up tasks show "Signed Up" badge (not another "Sign Up" button)
- [ ] Full tasks (no spots) show "All spots filled" badge; Sign Up disabled

---

## 5. Volunteer — My Hours

- [ ] Summary cards: Total / This Month / Pending Approval load from `GET /volunteers/{id}/hours/summary`
- [ ] Pending card shows orange when `pending_hours > 0`, default grey otherwise
- [ ] Time log table loads from `GET /volunteers/{id}/hours`
- [ ] Status badges: green (Approved) / amber (Pending)
- [ ] Date range filter refetches correctly
- [ ] Status filter (All / Pending / Approved)
- [ ] **Manual log hours** (if user has permission): "Log Hours" dialog opens, submits `POST /volunteers/{id}/hours`
- [ ] **Edit pending log**: pencil icon → edit dialog → updates hours/description
- [ ] **Delete pending log**: trash icon → confirmation → deleted
- [ ] Approved logs have no edit/delete buttons

---

## 6. Volunteer — Achievements & Leaderboards

### 6.1 Achievements
- [ ] Stats cards (Points / Badges / Streak / Rank) load from `/gamification/stats/volunteer/{id}`
- [ ] Badges tab: earned badges grid renders
- [ ] Points tab: points history list with transaction descriptions
- [ ] Achievements tab: progress bars for in-progress achievements

### 6.2 Leaderboards
- [ ] `GET /gamification/leaderboards/points?timeframe=all_time` — **public, no auth required**
- [ ] **Bug check**: Leaderboard is empty until generated. Admin must call `POST /gamification/leaderboards/generate` to populate
- [ ] Points / Hours / Projects tab switching works
- [ ] All Time / Monthly / Weekly timeframe filter
- [ ] Current user's row highlighted (correct user ID comparison)
- [ ] Landing page leaderboard widget also populates (uses same endpoint without auth)

---

## 7. Admin — Users

- [ ] `GET /users` list loads (paginated)
- [ ] Search by name/email filters correctly
- [ ] Active/Inactive filter
- [ ] **Create User**: dialog opens, submits `POST /users`, new user appears in list
- [ ] **Role change**: select different role → `PUT /users/{id}/role` → role updated
- [ ] User detail page `/portal/users/{id}` loads without error
- [ ] **Bug check**: `UserCreate` type exported from `lib/api/users.ts` (was broken in earlier TS check)

---

## 8. Admin / PM — Projects

### 8.1 List
- [ ] Project grid loads from `GET /projects`
- [ ] Status filter and category filter work
- [ ] Search by name works
- [ ] Project cards show: name, status badge, location, progress bar, volunteer count

### 8.2 Create / Edit
- [ ] "New Project" → form dialog → `POST /projects` → project appears in list
- [ ] Edit project → `PUT /projects/{id}` → changes reflected
- [ ] Status changes (planning → in_progress → completed)

### 8.3 Project detail `/portal/projects/{id}`
- [ ] Overview tab: details, team members, milestones
- [ ] Tasks tab: task list for this project
- [ ] Resources tab: allocated resources
- [ ] **Bug check**: `requires_volunteers` field on `TaskDetail` — may cause TS error (line 381 of tasks/[id]/page.tsx)

---

## 9. Admin / PM / Staff — Tasks

### 9.1 List views
- [ ] Kanban view: columns for Not Started / In Progress / Completed / Cancelled
- [ ] Table view: sortable list
- [ ] View toggle (Kanban ↔ Table) switches correctly
- [ ] Status / Priority / Project filters all work

### 9.2 Task CRUD
- [ ] Create task → `POST /tasks` → appears in board/table
- [ ] Edit task → `PUT /tasks/{id}` → changes reflected
- [ ] Drag task between Kanban columns → status updated (if implemented)
- [ ] "Assign Volunteer" dialog → `POST /tasks/{id}/assign` → volunteer assigned

### 9.3 Task detail `/portal/tasks/{id}`
- [ ] Subtasks, dependencies, volunteer assignments visible
- [ ] **Bug check**: `DependencyType` unused import (pre-existing TS warning, not a runtime bug)

---

## 10. Admin / Staff / PM — Volunteers

- [ ] Volunteer grid loads with status (Active / Inactive / Suspended)
- [ ] Search by name
- [ ] Status filter
- [ ] **Bug check**: `volunteers/page.tsx` has unused `mutate` (pre-existing TS warning)
- [ ] Volunteer detail `/portal/volunteers/{id}`: profile, skills, time logs, task assignments
- [ ] Admin can update volunteer status
- [ ] Admin can assign skills to volunteer

---

## 11. Approvals — Time Logs

- [ ] Table loads pending time logs (`GET /volunteers/hours?approved=false` or similar)
- [ ] Project / Date / Volunteer filters work
- [ ] **Approve**: `PATCH /volunteers/{volunteer_id}/hours/{time_log_id}/approve` → status changes to Approved
- [ ] **Reject**: reject button + notes → log marked rejected
- [ ] Batch approve (if implemented)
- [ ] **Bug check**: `approved_only` query param does not exist on `VolunteerHoursQueryParams` (pre-existing TS error line 86 of approvals page) — verify the actual filter sent to backend is correct

---

## 12. Resources

- [ ] Resource list loads from `GET /resources`
- [ ] Type filter (Human / Equipment / Material / Financial)
- [ ] Status filter (Active / Inactive)
- [ ] **Create resource**: `POST /resources` → appears in list
- [ ] Resource detail `/portal/resources/{id}` loads
- [ ] Edit / delete resource

---

## 13. Reports & Analytics

### 13.1 Reports exports
- [ ] Projects CSV → downloads file (test with real data)
- [ ] Volunteers CSV → downloads file
- [ ] Tasks CSV → downloads file
- [ ] Time Logs CSV → downloads file
- [ ] JSON variants for all four above
- [ ] **Bug check**: `reportsApi.exportProjectsCSV()` constructs URL as `getBaseURL() + '/reports/...'` where `getBaseURL()` = `''` → URL is `/reports/export/projects/csv?...` → proxied correctly — verify download actually works

### 13.2 Analytics
- [ ] Stats cards load (projects, volunteers, tasks, hours)
- [ ] Date range filter (7 days / 30 days / 3 months / 6 months / 1 year) refetches
- [ ] Charts render (volunteer trends, project distribution)

---

## 14. Gamification Admin

### 14.1 Badge management `/portal/gamification/badges`
- [ ] Badge list loads from `GET /gamification/badges`
- [ ] Create badge → `POST /gamification/badges`
- [ ] Edit badge (name, description, criteria)
- [ ] Delete badge

### 14.2 Achievement management `/portal/gamification/achievements`
- [ ] Achievement list loads
- [ ] Create / edit / delete achievement

### 14.3 Leaderboard admin `/portal/gamification/leaderboards`
- [ ] Current leaderboard data visible
- [ ] **Generate leaderboards** button → `POST /gamification/leaderboards/generate`
- [ ] After generation: volunteer leaderboard page shows rankings

### 14.4 Award badges/points `/portal/gamification`
- [ ] Search for volunteer by name
- [ ] Select badge → award → `POST /gamification/volunteers/{id}/badges/award`
- [ ] Award points → `POST /gamification/volunteers/{id}/points`
- [ ] Volunteer's achievement page reflects the new badge/points

---

## 15. Blog

### 15.1 Public blog (`/blog`)
- [ ] Blog list page loads (Portuguese by default, `/blog`)
- [ ] English blog: `/en/blog`
- [ ] `GET /blog/posts` returns published posts only (drafts hidden for non-admin)
- [ ] Category filter works
- [ ] Tag filter works
- [ ] Search works
- [ ] Post card shows title, excerpt, author name (not `author.full_name` crash)
- [ ] Click post → detail page loads
- [ ] **Bug check**: `post.author` is `Optional` — null guard in `BlogPostCard` prevents crash

### 15.2 Blog admin
- [ ] Create post `/portal/blog/new`:
  - Title, content, excerpt fields
  - **Featured image**: `ImagePicker` component (not URL input) → uploads to `/files/upload` → previews
  - Category + tag multi-select
  - Status (Draft / Published)
  - `POST /blog/posts` succeeds
- [ ] Post appears in `/portal/blog` list with correct status badge
- [ ] Edit post `/portal/blog/{id}`: loads existing data, saves changes
- [ ] Publish/Unpublish toggle works
- [ ] Delete post works
- [ ] Categories page `/portal/blog/categories`: CRUD works
- [ ] Tags page `/portal/blog/tags`:
  - [ ] `GET /blog/tags?limit=100` (NOT 200) — verify no 422
  - [ ] Create / edit / delete tags

### 15.3 Admin sees drafts
- [ ] Admin visits `/portal/blog` → drafts visible (not just published)
- [ ] **Bug check**: `GET /blog/posts` now uses `Depends(get_optional_user)` → authenticated admin sets `include_drafts=True`

---

## 16. Notifications

### 16.1 Notification list `/portal/notifications`
- [ ] `GET /notifications?limit=20&offset=0` returns notifications (not 404)
- [ ] Unread count badge visible in sidebar/header
- [ ] Click notification → marks as read
- [ ] "Mark all read" → `POST /notifications/mark-all-read`

### 16.2 Real-time SSE stream
- [ ] `EventSource` connects to `/notifications/stream?token={jwt}`
- [ ] **Bug check**: SSE endpoint at `/notifications/stream` — check the proxy rewrite for `/notifications` covers `/notifications/stream` (it does, via `/:path*` rule)
- [ ] New notifications arrive in real-time without page refresh (trigger one via admin API)
- [ ] SSE reconnects after network interruption

---

## 17. Settings

### 17.1 Profile edit
- [ ] Edit name, employee ID
- [ ] **Profile picture**: `ImagePicker` component → upload → preview → `PUT /users/{id}` with new URL
- [ ] Changes persist after page refresh

### 17.2 Password change
- [ ] Strength indicator updates in real-time
- [ ] Requirements checklist (length, uppercase, number, special char)
- [ ] Submit → `POST /auth/change-password` → success toast
- [ ] Wrong current password → clear error (not 500)
- [ ] New password same as old → rejected

### 17.3 Notification preferences
- [ ] Toggle switches send `PATCH /api/v1/preferences` (not 404)
- [ ] Preferences persist after page refresh

### 17.4 Theme preferences
- [ ] Light / Dark / System toggle works
- [ ] Choice synced to backend (`PATCH /api/v1/preferences`)
- [ ] Theme persists across sessions (loaded from backend on login)

---

## 18. File Uploads

- [ ] Blog featured image → select JPG/PNG/WebP/GIF → uploads → preview shown
- [ ] Profile picture → select image → uploads → preview shown
- [ ] SVG file → accepted
- [ ] File > 10MB → client-side error before upload attempt
- [ ] Unsupported type (e.g. `.exe`) → rejected by backend (415)
- [ ] **Bug check**: `localStorage.getItem('access_token')` (underscore) used in `filesApi.uploadFile` — verify 201 not 401
- [ ] Uploaded image URL is relative (`/uploads/...`) — renders correctly via proxy
- [ ] After upload, image persists on page refresh (not a blob URL)

---

## 19. Contact Form

- [ ] Public contact form on landing page submits without auth
- [ ] `POST /contact` → success message
- [ ] Admin → `/portal/contact` → contact submissions list appears
- [ ] Mark submission as read/resolved

---

## 20. Newsletter

- [ ] Newsletter popup on landing page (appears after X seconds)
- [ ] Subscribe → `POST /newsletter/subscribe` → confirmation email triggered
- [ ] Confirmation link → `GET /newsletter/confirm/{token}` → subscriber activated
- [ ] Admin subscriber list loads
- [ ] Unsubscribe link in email → `GET /newsletter/unsubscribe/{token}` → subscriber removed

---

## 21. Global Search

- [ ] `Ctrl+K` opens search overlay
- [ ] Typing queries → `GET /search?q=...` → results appear
- [ ] **Role-aware quick actions**: volunteer sees volunteer actions, admin sees admin actions
- [ ] Clicking result navigates correctly

---

## 22. Project Manager — My Projects

- [ ] `GET /projects?project_manager_id={id}` returns PM's own projects
- [ ] Status filter tabs work
- [ ] Create project dialog
- [ ] Edit / delete project
- [ ] Team view `/portal/team` — volunteers assigned to PM's projects
- [ ] **Bug check**: `response.items` vs `response.data` — PaginatedResponse shape consistency (line 58 of team/page.tsx has TS error)

---

## 23. Interactive Tours (all roles)

- [ ] First visit to each page → tour auto-starts (after 900ms delay)
- [ ] Tour auto-starts only ONCE per page (tracked in `localStorage.tour_seen_{id}`)
- [ ] `?` icon button triggers tour manually on all pages
- [ ] Tooltip shows "Take a Tour" / "Fazer Tour" on hover
- [ ] Tour steps highlight correct elements (check `data-tour` attrs exist in DOM)
- [ ] Tour works in Portuguese (translated step text)
- [ ] All 5 volunteer pages: dashboard, my-tasks, available-tasks, my-hours, achievements
- [ ] All 11 staff pages: projects, tasks, volunteers, resources, approvals, reports, analytics, users, team, gamification, my-projects

---

## 24. i18n — Language Switching

- [ ] Toggle to English → all UI strings in English (no MISSING_MESSAGE errors in console)
- [ ] Toggle to Portuguese → all UI strings in Portuguese
- [ ] **Bug check**: console for `MISSING_MESSAGE:` errors — especially in `Blog.filter.*` namespace
- [ ] Date formats localise correctly (English: "Jan 15, 2025" / Portuguese: "15 de jan. de 2025")

---

## 25. Proxy & Networking

- [ ] Access app from another device on the LAN at `http://<machine-ip>:3000`
- [ ] Login works from that device
- [ ] API calls return data (not 404/CORS errors)
- [ ] File uploads work from that device
- [ ] **Bug check**: no `127.0.0.1:8000` or backend address in browser Network tab responses

---

## 26. Known Bugs / TODOs (not yet fixed)

Track these separately — they are documented code TODOs, not regressions.

| ID | Location | Description | Severity |
|---|---|---|---|
| B1 | `auth.py:150` | Email verification sent synchronously, not in background task | Low |
| B2 | `files.py:195,241` | No permission check on file list — any authed user sees all files | Medium |
| B3 | `files.py:277` | Project managers cannot delete project files | Low |
| B4 | `notifications.py:287` | `/notifications/create` has no admin permission check | Medium |
| B5 | `sync.py:340` | Sync endpoint returns all data regardless of user permissions | Medium |
| B6 | `auth_enhanced.py:926` | Google OAuth `state` param not validated in callback (CSRF risk) | High |
| B7 | `reports.ts:43` | `getBaseURL()` used redundantly (returns `''`, so URL is correct but pattern is wrong) | Low |
| B8 | `team/page.tsx:58` | `response.items` vs `PaginatedResponse.data` TS error — check actual API shape | Medium |
| B9 | `gamification` | Leaderboards are empty until manually generated — no auto-schedule | Medium |
| B10 | `tasks/[id]/page.tsx:381` | `TaskDetail.requires_volunteers` field doesn't exist in type | Low |

---

## 27. Entity Relationship Smoke Test

Verify the full data flow chain works end-to-end:

```
User registers
  └── Volunteer profile auto-created
        └── Volunteer signs up for Task
              └── Task belongs to Project
                    └── Volunteer starts timer (My Tasks)
                          └── Task marked complete
                                └── Time Log created (Pending)
                                      └── Admin approves Time Log
                                            └── Hours count in My Hours (Approved)
                                                  └── Gamification triggers (points awarded)
                                                        └── Leaderboard generated
                                                              └── Landing page shows updated leaderboard
```

- [ ] Full chain above works without errors
- [ ] At each step, verify the correct HTTP status (201/200, not 422/500)
- [ ] Volunteer's "Total Hours" in My Hours summary reflects approved hours
- [ ] Volunteer's points appear in Achievements → Points tab
- [ ] Admin runs "Generate Leaderboards" → volunteer appears with correct ranking

---

## Results Summary

| Section | Pass | Fail | Notes |
|---|---|---|---|
| 1. Auth | | | |
| 2. Onboarding | | | |
| 3. My Tasks | | | |
| 4. Available Tasks | | | |
| 5. My Hours | | | |
| 6. Achievements/Leaderboards | | | |
| 7. Users | | | |
| 8. Projects | | | |
| 9. Tasks | | | |
| 10. Volunteers | | | |
| 11. Approvals | | | |
| 12. Resources | | | |
| 13. Reports/Analytics | | | |
| 14. Gamification Admin | | | |
| 15. Blog | | | |
| 16. Notifications | | | |
| 17. Settings | | | |
| 18. File Uploads | | | |
| 19. Contact | | | |
| 20. Newsletter | | | |
| 21. Search | | | |
| 22. PM / My Projects | | | |
| 23. Tours | | | |
| 24. i18n | | | |
| 25. Proxy/Networking | | | |
| 27. Entity Chain | | | |
