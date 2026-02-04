# API Requirements for Volunteer Pages

This document lists API endpoints that need enhancement or modification to support the volunteer-specific pages.

## My Tasks Page

### Current Endpoint
`GET /tasks/volunteers/{volunteer_id}/assignments`

**Current Response:** Returns `TaskVolunteerAssignment[]`
```typescript
interface TaskVolunteerAssignment {
  id: number;
  task_id: number;
  volunteer_id: number;
  assigned_at: string;
  removed_at?: string;
  volunteer_name?: string;
  hours_contributed: number;
}
```

### Required Enhancement
The endpoint should return extended task information by joining with the tasks table:

```typescript
interface VolunteerTaskAssignmentExtended {
  id: number;
  task_id: number;
  volunteer_id: number;
  assigned_at: string;
  hours_contributed: number;

  // Extended task fields (from tasks table)
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  project_name: string;
  end_date?: string;
  progress_percentage: number;
  is_overdue: boolean;
  days_remaining?: number;
}
```

**SQL Query Example:**
```sql
SELECT
  tva.id,
  tva.task_id,
  tva.volunteer_id,
  tva.assigned_at,
  tva.hours_contributed,
  t.title,
  t.status,
  t.priority,
  t.progress_percentage,
  t.end_date,
  p.name as project_name,
  CASE
    WHEN t.end_date < NOW() AND t.status != 'completed' THEN true
    ELSE false
  END as is_overdue,
  CASE
    WHEN t.end_date IS NOT NULL
    THEN DATE_PART('day', t.end_date - NOW())::int
    ELSE NULL
  END as days_remaining
FROM task_volunteer_assignments tva
JOIN tasks t ON tva.task_id = t.id
JOIN projects p ON t.project_id = p.id
WHERE tva.volunteer_id = ?
  AND tva.removed_at IS NULL
ORDER BY t.end_date ASC NULLS LAST, t.priority DESC
```

**Benefits:**
- Single query instead of N+1 queries
- Better performance
- Complete task information for volunteer view
- Includes calculated fields (is_overdue, days_remaining)

## Alternative Approach (Current Implementation)

If the backend cannot be modified immediately, the frontend can:
1. Fetch volunteer assignments
2. For each assignment, fetch task details using `GET /tasks/{task_id}`
3. Combine the data on the client side

This is less efficient but works with the current API.

---

## Other Endpoints to Review

### My Hours Page
- `GET /volunteers/{volunteer_id}/hours` - Working as expected
  - Returns array of VolunteerTimeLog
  - Frontend handles current month calculation
- `GET /volunteers/{volunteer_id}/hours/summary` - Working as expected
  - Returns: total_hours, approved_hours, pending_hours
  - Returns: hours_by_month, hours_by_project (for future charts)
  - Current implementation: Frontend calculates "This Month" from time logs
  - **Enhancement opportunity:** Backend could include `current_month_hours` field

### Available Tasks Page
- `GET /tasks/volunteers/available` - Needs filtering by skills, project, date range

### My Achievements Page
- `GET /gamification/stats/volunteer/{volunteer_id}` - Full summary
- `GET /gamification/volunteers/{volunteer_id}/badges` - Badge list with earned status
- `GET /gamification/volunteers/{volunteer_id}/points` - Points history

### Leaderboards Page
- `GET /gamification/leaderboards/{type}?timeframe={timeframe}` - Rankings
- `GET /gamification/leaderboards/volunteer/{volunteer_id}/position` - User's position
