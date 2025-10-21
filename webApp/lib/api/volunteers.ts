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
        apiClient.get<VolunteerTimeLog[]>(`/volunteers/${volunteerId}/hours`, params),

    logVolunteerHours: (volunteerId: number, data: VolunteerTimeLogCreate) =>
        apiClient.post<VolunteerTimeLog>(`/volunteers/${volunteerId}/hours`, data),

    updateTimeLog: (timeLogId: number, data: VolunteerTimeLogUpdate) =>
        apiClient.put<VolunteerTimeLog>(`/volunteers/hours/${timeLogId}`, data),

    deleteTimeLog: (timeLogId: number) =>
        apiClient.delete<void>(`/volunteers/hours/${timeLogId}`),

    approveTimeLog: (timeLogId: number, data: VolunteerTimeLogApproval) =>
        apiClient.post<VolunteerTimeLog>(`/volunteers/hours/${timeLogId}/approve`, data),

    getVolunteerHoursSummary: (volunteerId: number) =>
        apiClient.get<VolunteerHoursSummary>(`/volunteers/${volunteerId}/hours/summary`),
};
