# UI Improvement Progress

Tracking spec compliance, UX improvements, and i18n fixes across all portal modules.
Reference: `docs/ui-specification.md`

---

## Status Legend
| Symbol | Meaning |
|--------|---------|
| ✅ | Complete |
| 🔄 | In Progress |
| ❌ | Bug / Broken |
| ⚠️ | i18n Violation |
| 📋 | Missing UX (spec feature) |
| — | N/A |

---

## Volunteer Pages

| Module | File | Bugs | i18n | UX / Spec | Status |
|--------|------|------|------|-----------|--------|
| My Tasks | `portal/my-tasks/page.tsx` | ❌ Wrong API endpoint (fixed) | ✅ | ✅ | ✅ Complete |
| My Hours | `portal/my-hours/page.tsx` | ✅ SWR key fixed | ⚠️ "Time Logs" hardcoded (fixed) | 📋 Date range filter (in progress) | 🔄 |
| Available Tasks | `portal/available-tasks/page.tsx` | ❌ Unused projects fetch (fixed) | ⚠️ 'Signing up...' hardcoded (fixed) | ✅ | ✅ Complete |
| My Achievements | `portal/achievements/page.tsx` | ✅ | ✅ | ✅ | ✅ Complete |
| Leaderboards | `portal/leaderboards/page.tsx` | ✅ | ⚠️ "Timeframe", "Top 3", "Full Rankings" (fixed) | 📋 Scroll to my position | 🔄 |

---

## Admin / Staff Pages

| Module | File | Bugs | i18n | UX / Spec | Status |
|--------|------|------|------|-----------|--------|
| Gamification Awards | `portal/gamification/page.tsx` | ✅ | ✅ | ✅ | ✅ Complete |
| Gamification Badges | `portal/gamification/badges/page.tsx` | ✅ | ✅ | ✅ | ✅ Complete |
| Gamification Achievements | `portal/gamification/achievements/page.tsx` | ✅ | ✅ | ✅ | ✅ Complete |
| Gamification Leaderboards | `portal/gamification/leaderboards/page.tsx` | ✅ | ⚠️ 20+ hardcoded strings (fixed) | ✅ | ✅ Complete |
| Time Log Approvals | `portal/approvals/time-logs/page.tsx` | ❌ volunteers?.items?.map fixed | ✅ | ✅ | ✅ Complete |
| Blog Posts | `portal/blog/page.tsx` | ✅ | ✅ | ✅ | ✅ Complete |
| Blog New Post | `portal/blog/new/page.tsx` | ✅ | ✅ | ✅ | ✅ Complete |
| Blog Edit Post | `portal/blog/[id]/page.tsx` | ✅ | ✅ | ✅ | ✅ Complete |
| Blog Categories | `portal/blog/categories/page.tsx` | ✅ | ✅ | ✅ | ✅ Complete |
| Blog Tags | `portal/blog/tags/page.tsx` | ✅ | ✅ | ✅ | ✅ Complete |

---

## Project Manager Pages

| Module | File | Bugs | i18n | UX / Spec | Status |
|--------|------|------|------|-----------|--------|
| My Projects | `portal/my-projects/page.tsx` | ✅ | ✅ | ✅ | ✅ Complete |
| Team | `portal/team/page.tsx` | ❌ res.data.map fixed | ✅ | ✅ | ✅ Complete |
| Project Detail | `portal/projects/[id]/page.tsx` | ✅ | ✅ | ✅ | ✅ Complete |

---

## Shared Components

| Component | File | Bugs | i18n | Status |
|-----------|------|------|------|--------|
| App Sidebar | `components/app-sidebar.tsx` | ✅ | ⚠️ Gamification submenu labels (fixed) | ✅ Complete |

---

## Issues Log

### Fixed in This Session

| Priority | File | Issue | Fix |
|----------|------|-------|-----|
| P0 | `available-tasks/page.tsx` | Unused projects SWR fetch + loading race | Removed unused fetch |
| P0 | `available-tasks/page.tsx:216` | Hardcoded `'Signing up...'` | → `t('signUp.loading')` |
| P1 | `leaderboards/page.tsx` (volunteer) | "Timeframe", "Top 3", "Full Rankings" hardcoded | Added i18n keys |
| P1 | `gamification/leaderboards/page.tsx` (admin) | 20+ hardcoded strings | Full i18n pass |
| P1 | `my-hours/page.tsx:155` | "Time Logs" CardTitle hardcoded | → `t('timeLogs')` |
| P1 | `app-sidebar.tsx` | Gamification submenu labels hardcoded | Added nav keys |
| P2 | `my-hours/page.tsx` | No date range filter | Added Popover+Calendar pickers |

### Previously Fixed (API Audit)

| Priority | File | Issue | Fix |
|----------|------|-------|-----|
| P0 | `my-tasks/page.tsx` | Wrong API endpoint | Switched to `getVolunteerTasks()` |
| P1 | `my-hours/page.tsx` | `statusFilter` in SWR key but not in fetcher | Removed from key |
| P0 | `approvals/time-logs/page.tsx` | `volunteers?.items?.map` → `volunteers?.map` | Fixed map call |
| P0 | `team/page.tsx` | `res.data.map` → `res.items.map` | Fixed map call |

---

## Outstanding / Future Work

| Priority | Module | Description |
|----------|--------|-------------|
| P2 | Volunteer Leaderboards | Add "scroll to my position" button |
| P3 | Available Tasks card | Show skills, estimated hours, spots in card (requires API fields) |
| P3 | Volunteer Dashboard | Role-specific widgets (step 6 of CLAUDE.md plan) |
