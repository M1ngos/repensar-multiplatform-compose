import { apiClient } from './client';
import type {
    Volunteer,
    VolunteerProfile,
    VolunteerSummary,
    VolunteerRegistration,
    VolunteerUpdate,
    VolunteerStats,
    VolunteerSkill,
    VolunteerSkillAssignment,
    VolunteerSkillAssignmentCreate,
    VolunteerSkillAssignmentUpdate,
    VolunteerTimeLog,
    VolunteerTimeLogCreate,
    VolunteerTimeLogUpdate,
    VolunteerTimeLogApproval,
    VolunteerHoursSummary,
    VolunteerQueryParams,
    VolunteerHoursQueryParams,
    PaginatedResponse,
    ProjectSummary,
    TaskSummary,
    ActivityLog,
} from './types';

export const volunteersApi = {
    // Volunteer CRUD
    getVolunteers: (params?: VolunteerQueryParams) =>
        apiClient.get<VolunteerSummary[]>('/volunteers/', params),

    getVolunteer: (volunteerId: number) =>
        apiClient.get<VolunteerProfile>(`/volunteers/${volunteerId}`),

    registerVolunteer: (data: VolunteerRegistration) =>
        apiClient.post<Volunteer>('/volunteers/register', data),

    updateVolunteer: (volunteerId: number, data: VolunteerUpdate) =>
        apiClient.put<Volunteer>(`/volunteers/${volunteerId}`, data),

    deleteVolunteer: (volunteerId: number) =>
        apiClient.delete<void>(`/volunteers/${volunteerId}`),

    // Stats
    getVolunteerStats: () =>
        apiClient.get<VolunteerStats>('/volunteers/stats'),

    // Skills
    getAvailableSkills: () =>
        apiClient.get<VolunteerSkill[]>('/volunteers/skills/available'),

    getVolunteerSkills: (volunteerId: number) =>
        apiClient.get<VolunteerSkillAssignment[]>(`/volunteers/${volunteerId}/skills`),

    addVolunteerSkill: (volunteerId: number, data: VolunteerSkillAssignmentCreate) =>
        apiClient.post<VolunteerSkillAssignment>(`/volunteers/${volunteerId}/skills`, data),

    updateVolunteerSkill: (volunteerId: number, skillId: number, data: VolunteerSkillAssignmentUpdate) =>
        apiClient.put<VolunteerSkillAssignment>(`/volunteers/${volunteerId}/skills/${skillId}`, data),

    removeVolunteerSkill: (volunteerId: number, skillId: number) =>
        apiClient.delete<void>(`/volunteers/${volunteerId}/skills/${skillId}`),

    // Time logs / Hours
    getVolunteerHours: (volunteerId: number, params?: VolunteerHoursQueryParams) =>
        apiClient.get<VolunteerTimeLog[]>(`/volunteers/${volunteerId}/time-logs`, params),

    logVolunteerHours: (volunteerId: number, data: VolunteerTimeLogCreate) =>
        apiClient.post<VolunteerTimeLog>(`/volunteers/${volunteerId}/time-logs`, data),

    updateTimeLog: (timeLogId: number, data: VolunteerTimeLogUpdate) =>
        apiClient.put<VolunteerTimeLog>(`/volunteers/time-logs/${timeLogId}`, data),

    deleteTimeLog: (timeLogId: number) =>
        apiClient.delete<void>(`/volunteers/time-logs/${timeLogId}`),

    approveTimeLog: (timeLogId: number, data: VolunteerTimeLogApproval) =>
        apiClient.post<VolunteerTimeLog>(`/volunteers/time-logs/${timeLogId}/approve`, data),

    getVolunteerHoursSummary: (volunteerId: number) =>
        apiClient.get<VolunteerHoursSummary>(`/volunteers/${volunteerId}/time-logs/summary`),

    // ==================== v2.0 Paginated Endpoints ====================

    /**
     * Get paginated projects for a volunteer (v2.0)
     *
     * @param volunteerId Volunteer ID
     * @param params Query parameters (page, page_size, status)
     * @returns Paginated list of projects
     */
    getVolunteerProjects: (
        volunteerId: number,
        params?: {
            page?: number;
            page_size?: number;
            status?: string;
        }
    ) =>
        apiClient.get<PaginatedResponse<ProjectSummary>>(`/volunteers/${volunteerId}/projects`, params),

    /**
     * Get paginated tasks for a volunteer (v2.0)
     *
     * @param volunteerId Volunteer ID
     * @param params Query parameters (page, page_size, status, project_id)
     * @returns Paginated list of tasks
     */
    getVolunteerTasks: (
        volunteerId: number,
        params?: {
            page?: number;
            page_size?: number;
            status?: string;
            project_id?: number;
        }
    ) =>
        apiClient.get<PaginatedResponse<TaskSummary>>(`/volunteers/${volunteerId}/tasks`, params),

    /**
     * Get paginated activity log for a volunteer (v2.0)
     *
     * @param volunteerId Volunteer ID
     * @param params Query parameters (page, page_size, action_filter)
     * @returns Paginated list of activity logs
     */
    getVolunteerActivity: (
        volunteerId: number,
        params?: {
            page?: number;
            page_size?: number;
            action_filter?: string;
        }
    ) =>
        apiClient.get<PaginatedResponse<ActivityLog>>(`/volunteers/${volunteerId}/activity`, params),
};
