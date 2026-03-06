# Frontend API Audit Progress

Cross-referencing every portal page against actual backend endpoints.

**Backend base:** `http://localhost:8000`
**API client:** `lib/api/` modules with SWR for data fetching

---

## Pages Audited

### Blog
- [x] `portal/blog/page.tsx` — GET/DELETE /blog/posts, publish/unpublish ✅
- [x] `portal/blog/new/page.tsx` — POST /blog/posts, GET categories/tags ✅
- [x] `portal/blog/[id]/page.tsx` — GET + PUT /blog/posts/{id}, GET categories/tags ✅
- [x] `portal/blog/categories/page.tsx` — CRUD /blog/categories ✅
- [x] `portal/blog/tags/page.tsx` — CRUD /blog/tags ✅

### Projects
- [x] `portal/projects/[id]/page.tsx` — GET /projects/{id}, GET /projects/{id}/team, DELETE /projects/{id} ✅
- [x] `portal/projects/page.tsx` — GET /projects/ with filters ✅
- [x] `portal/my-projects/page.tsx` — GET /projects/?manager_id=, GET/PUT/DELETE /projects/{id} ✅

### Team
- [x] `portal/team/page.tsx` — **FIXED**: `res.data.map(...)` on `getProjectVolunteers()` result; correct accessor is `res.items` (returns `PaginatedResponse<VolunteerSummary>`) ✅

### Volunteer Dashboard
- [x] `portal/my-tasks/page.tsx` — **FIXED**: was using wrong endpoint `/tasks/volunteers/{id}/assignments` (returns raw join-table rows, missing task details). Switched to `GET /volunteers/{id}/tasks` (returns full `TaskSummary`). Status filter now server-side.
- [x] `portal/my-hours/page.tsx` — **FIXED**: `statusFilter` was in SWR key but never passed to API, causing redundant re-fetches. Key simplified to `['time-logs', user.id]`.
- [x] `portal/available-tasks/page.tsx` — GET /tasks/?suitable_for_volunteers=true, POST /tasks/{id}/volunteers ✅
- [x] `portal/achievements/page.tsx` — GET gamification stats, badges, points, achievements; PUT badge showcase ✅
- [x] `portal/leaderboards/page.tsx` — GET /gamification/leaderboards/{type}?timeframe=... ✅

### Gamification Admin
- [x] `portal/gamification/page.tsx` — Award badges/points to volunteers ✅
- [x] `portal/gamification/badges/page.tsx` — CRUD /gamification/badges ✅
- [x] `portal/gamification/achievements/page.tsx` — CRUD /gamification/achievements ✅
- [x] `portal/gamification/leaderboards/page.tsx` — GET /gamification/leaderboards/{type} ✅

### Volunteers
- [x] `portal/volunteers/page.tsx` — GET /volunteers/ with filters ✅
- [x] `portal/volunteers/[id]/page.tsx` — GET /volunteers/{id}, GET /volunteers/{id}/hours, GET /volunteers/{id}/hours/summary ✅

### Tasks
- [x] `portal/tasks/page.tsx` — GET /tasks/ with filters ✅
- [x] `portal/tasks/[id]/page.tsx` — GET /tasks/{id}, DELETE /tasks/{id}, task dependencies + volunteer assignments ✅

### Resources
- [x] `portal/resources/page.tsx` — GET /resources/ with filters ✅
- [x] `portal/resources/[id]/page.tsx` — GET /resources/{id} (edit/delete intentionally disabled) ✅

### Profile & Settings
- [x] `portal/profile/page.tsx` — GET/PUT /users/{id} ✅
- [x] `portal/settings/page.tsx` — POST /auth/change-password ✅

### Analytics & Reports
- [x] `portal/analytics/page.tsx` — GET /analytics/dashboard, GET /analytics/trends/volunteer-hours ✅
- [x] `portal/reports/page.tsx` — CSV/JSON export endpoints ✅

### Admin
- [x] `portal/approvals/time-logs/page.tsx` — **FIXED**: `volunteers?.items?.map(...)` but `getVolunteers()` returns flat `VolunteerSummary[]` (not paginated). Corrected to `volunteers?.map(...)`. Without fix, approval queue always showed empty. ✅
- [x] `portal/contact/page.tsx` — GET /contact/, PATCH /contact/{id}/read, DELETE /contact/{id} ✅

### Sidebar
- [x] `components/app-sidebar.tsx` — Role-based nav correctly configured ✅

### Dashboard
- [x] `portal/page.tsx` — delegates to role-specific components ✅

---

## Pages Not Yet Audited

*(All pages now audited)*

---

## Fixes Applied

| # | File | Issue | Fix |
|---|------|-------|-----|
| 1 | `portal/my-tasks/page.tsx` | Wrong endpoint — `getVolunteerAssignments()` returns bare join rows, not task details. Unsafe `as unknown as` cast. | Switched to `volunteersApi.getVolunteerTasks()` → `GET /volunteers/{id}/tasks`. Added `task_id: task.id` mapping for `TaskCard`. |
| 2 | `portal/my-hours/page.tsx` | `statusFilter` in SWR key but not passed to API — re-fetched all data on every filter change | Removed `statusFilter` from SWR key; filtering stays client-side using `log.approved` boolean |
| 3 | `portal/approvals/time-logs/page.tsx` | `volunteers?.items?.map(...)` — `getVolunteers()` returns flat `VolunteerSummary[]`, not a paginated response. `.items` is always undefined → approval queue always empty. | Changed to `volunteers?.map(...)` |
| 4 | `portal/team/page.tsx` | `res.data.map(...)` on `getProjectVolunteers()` result — returns `PaginatedResponse<VolunteerSummary>` with `.items`, not `.data`. TypeError thrown → caught silently → team always empty. | Changed to `res.items.map(...)` |

---

## Backend Notes

- `VolunteerTimeLog.approved` is a **boolean** — no "rejected" state exists in the DB. Frontend correctly maps: approved=true → "Approved", approved=false → "Pending".
- `/volunteers/{id}/hours` query param is `approved_only: bool`, not a `status` enum.
- Leaderboard entry shape uses `volunteer_name`, `volunteer_avatar`, `volunteer_email`, `value` fields.
- `projectsApi.getProjects()` → `ProjectSummary[]` (flat array, not paginated).
- `volunteersApi.getVolunteers()` → `VolunteerSummary[]` (flat array, not paginated).
- `projectsApi.getProjectVolunteers()` → `PaginatedResponse<VolunteerSummary>` (paginated, use `.items`).
- `volunteersApi.getVolunteerTasks()` → `PaginatedResponse<TaskSummary>` (paginated, use `.items`).
