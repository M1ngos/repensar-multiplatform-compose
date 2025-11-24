/**
 * Time Tracking Permission Utilities
 *
 * Handles role-based access control for the volunteer time tracking module.
 * Based on the specification:
 * - Volunteers: Can log, view, edit/delete own pending logs
 * - Staff/Managers: Can approve/reject logs, view all logs in their projects
 * - Admins: Full access to all time logs system-wide
 */

import type { UserProfile } from '@/lib/api/types';
import type { VolunteerTimeLog } from '@/lib/api/types';

/**
 * User role constants
 */
export const USER_ROLES = {
  VOLUNTEER: 'volunteer',
  STAFF_MEMBER: 'staff_member',
  PROJECT_MANAGER: 'project_manager',
  ADMIN: 'admin',
} as const;

/**
 * Supervisor/Manager roles - can approve time logs
 */
const SUPERVISOR_ROLES = [
  USER_ROLES.STAFF_MEMBER,
  USER_ROLES.PROJECT_MANAGER,
  USER_ROLES.ADMIN,
];

/**
 * Admin roles - full access to everything
 */
const ADMIN_ROLES = [USER_ROLES.ADMIN];

/**
 * Check if user has a specific role
 */
export function hasRole(user: UserProfile | null | undefined, role: string): boolean {
  if (!user) return false;
  return user.user_type === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: UserProfile | null | undefined, roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.user_type);
}

/**
 * Check if user is a supervisor/manager who can approve time logs
 */
export function canApproveTimeLogs(user: UserProfile | null | undefined): boolean {
  return hasAnyRole(user, SUPERVISOR_ROLES);
}

/**
 * Check if user is an admin with full system access
 */
export function isAdmin(user: UserProfile | null | undefined): boolean {
  return hasAnyRole(user, ADMIN_ROLES);
}

/**
 * Check if user is a regular volunteer
 */
export function isVolunteer(user: UserProfile | null | undefined): boolean {
  return hasRole(user, USER_ROLES.VOLUNTEER);
}

/**
 * Check if user can edit a specific time log
 * Rules:
 * - Volunteers can edit their own pending (unapproved) logs
 * - Admins can edit any log
 */
export function canEditTimeLog(
  user: UserProfile | null | undefined,
  timeLog: VolunteerTimeLog | null | undefined
): boolean {
  if (!user || !timeLog) return false;

  // Admins can edit anything
  if (isAdmin(user)) return true;

  // Regular users can only edit their own pending logs
  return timeLog.volunteer_id === user.id && !timeLog.approved;
}

/**
 * Check if user can delete a specific time log
 * Rules:
 * - Volunteers can delete their own pending (unapproved) logs
 * - Admins can delete any log
 */
export function canDeleteTimeLog(
  user: UserProfile | null | undefined,
  timeLog: VolunteerTimeLog | null | undefined
): boolean {
  if (!user || !timeLog) return false;

  // Admins can delete anything
  if (isAdmin(user)) return true;

  // Regular users can only delete their own pending logs
  return timeLog.volunteer_id === user.id && !timeLog.approved;
}

/**
 * Check if user can view a specific time log
 * Rules:
 * - Volunteers can view their own logs
 * - Supervisors/managers can view logs in their projects
 * - Admins can view all logs
 */
export function canViewTimeLog(
  user: UserProfile | null | undefined,
  timeLog: VolunteerTimeLog | null | undefined
): boolean {
  if (!user || !timeLog) return false;

  // Admins can view everything
  if (isAdmin(user)) return true;

  // Supervisors/managers can view all logs (backend will filter by their projects)
  if (canApproveTimeLogs(user)) return true;

  // Volunteers can view their own logs
  return timeLog.volunteer_id === user.id;
}

/**
 * Check if user can access the approval queue
 * Only supervisors, managers, and admins can access
 */
export function canAccessApprovalQueue(user: UserProfile | null | undefined): boolean {
  return canApproveTimeLogs(user);
}

/**
 * Check if user can view all volunteer time logs (system-wide)
 * Only admins have system-wide access
 */
export function canViewAllTimeLogs(user: UserProfile | null | undefined): boolean {
  return isAdmin(user);
}

/**
 * Check if user can log hours on behalf of another volunteer
 * Only staff, managers, and admins can log hours for others
 */
export function canLogHoursForOthers(user: UserProfile | null | undefined): boolean {
  return hasAnyRole(user, SUPERVISOR_ROLES);
}

/**
 * Check if user can export time log reports
 * Staff, managers, and admins can export reports
 */
export function canExportReports(user: UserProfile | null | undefined): boolean {
  return hasAnyRole(user, [
    USER_ROLES.STAFF_MEMBER,
    USER_ROLES.PROJECT_MANAGER,
    USER_ROLES.ADMIN,
  ]);
}

/**
 * Check if user can view the hours dashboard
 * Everyone can view their own dashboard, but supervisors/admins can view others'
 */
export function canViewHoursDashboard(
  user: UserProfile | null | undefined,
  volunteerId?: number
): boolean {
  if (!user) return false;

  // Everyone can view their own dashboard
  if (!volunteerId || volunteerId === user.id) return true;

  // Supervisors and admins can view others' dashboards
  return canApproveTimeLogs(user);
}

/**
 * Get the appropriate redirect path based on user role after login
 */
export function getDefaultRedirectPath(user: UserProfile | null | undefined): string {
  if (!user) return '/';

  // Admins and managers go to approval queue if they have pending items
  if (canApproveTimeLogs(user)) {
    return '/portal/approvals/time-logs';
  }

  // Volunteers go to their profile/hours page
  return `/portal/volunteers/${user.id}`;
}

/**
 * Get user-friendly role display name
 */
export function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    [USER_ROLES.VOLUNTEER]: 'Volunteer',
    [USER_ROLES.STAFF_MEMBER]: 'Staff Member',
    [USER_ROLES.PROJECT_MANAGER]: 'Project Manager',
    [USER_ROLES.ADMIN]: 'Administrator',
  };

  return roleNames[role] || role;
}
