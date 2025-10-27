/**
 * Projects API Methods
 *
 * Handles all project-related endpoints including:
 * - Projects CRUD
 * - Project team management
 * - Milestones management
 * - Environmental metrics
 * - Project dashboard and stats
 */

import { apiClient } from './client';
import type {
  Project,
  ProjectCreate,
  ProjectUpdate,
  ProjectSummary,
  ProjectDetail,
  ProjectDashboard,
  ProjectStats,
  ProjectQueryParams,
  ProjectTeamMember,
  ProjectTeamCreate,
  ProjectTeamUpdate,
  Milestone,
  MilestoneCreate,
  MilestoneUpdate,
  EnvironmentalMetric,
  EnvironmentalMetricCreate,
  EnvironmentalMetricUpdate,
  PaginatedResponse,
  TaskSummary,
  VolunteerSummary,
  ResourceAllocation,
  ActivityLog,
} from './types';

export const projectsApi = {
  // ==================== Projects CRUD ====================

  /**
   * Get list of projects with optional filtering
   *
   * @param params Query parameters for filtering and pagination
   * @returns Array of project summaries
   */
  getProjects: (params?: ProjectQueryParams) =>
    apiClient.get<ProjectSummary[]>('/projects/', params),

  /**
   * Get detailed project information
   *
   * @param projectId Project ID
   * @returns Detailed project information with team, milestones, and metrics
   */
  getProject: (projectId: number) =>
    apiClient.get<ProjectDetail>(`/projects/${projectId}`),

  /**
   * Create a new project
   *
   * @param data Project creation data
   * @returns Created project
   */
  createProject: (data: ProjectCreate) =>
    apiClient.post<Project>('/projects/', data),

  /**
   * Update existing project
   *
   * @param projectId Project ID
   * @param data Project update data
   * @returns Updated project
   */
  updateProject: (projectId: number, data: ProjectUpdate) =>
    apiClient.put<Project>(`/projects/${projectId}`, data),

  /**
   * Delete project (marks as cancelled)
   *
   * @param projectId Project ID
   * @returns Success response
   */
  deleteProject: (projectId: number) =>
    apiClient.delete<{ message: string }>(`/projects/${projectId}`),

  // ==================== Project Dashboard & Stats ====================

  /**
   * Get projects dashboard data
   *
   * @returns Array of projects with dashboard metrics
   */
  getProjectsDashboard: () =>
    apiClient.get<ProjectDashboard[]>('/projects/dashboard'),

  /**
   * Get project statistics
   *
   * @returns Aggregated project statistics
   */
  getProjectsStats: () =>
    apiClient.get<ProjectStats>('/projects/stats'),

  // ==================== Project Team Management ====================

  /**
   * Get project team members
   *
   * @param projectId Project ID
   * @returns Array of team members
   */
  getProjectTeam: (projectId: number) =>
    apiClient.get<ProjectTeamMember[]>(`/projects/${projectId}/team`),

  /**
   * Add team member to project
   *
   * @param projectId Project ID
   * @param data Team member data
   * @returns Created team member
   */
  addTeamMember: (projectId: number, data: ProjectTeamCreate) =>
    apiClient.post<ProjectTeamMember>(`/projects/${projectId}/team`, data),

  /**
   * Update team member role
   *
   * @param projectId Project ID
   * @param userId User ID
   * @param data Team member update data
   * @returns Updated team member
   */
  updateTeamMember: (projectId: number, userId: number, data: ProjectTeamUpdate) =>
    apiClient.put<ProjectTeamMember>(`/projects/${projectId}/team/${userId}`, data),

  /**
   * Remove team member from project
   *
   * @param projectId Project ID
   * @param userId User ID
   * @returns Success response
   */
  removeTeamMember: (projectId: number, userId: number) =>
    apiClient.delete<{ message: string }>(`/projects/${projectId}/team/${userId}`),

  // ==================== Milestones Management ====================

  /**
   * Get project milestones
   *
   * @param projectId Project ID
   * @returns Array of milestones
   */
  getMilestones: (projectId: number) =>
    apiClient.get<Milestone[]>(`/projects/${projectId}/milestones`),

  /**
   * Create milestone for project
   *
   * @param data Milestone data (includes project_id)
   * @returns Created milestone
   */
  createMilestone: (data: MilestoneCreate) =>
    apiClient.post<Milestone>(`/projects/${data.project_id}/milestones`, data),

  /**
   * Update milestone
   *
   * @param milestoneId Milestone ID
   * @param data Milestone update data
   * @returns Updated milestone
   */
  updateMilestone: (milestoneId: number, data: MilestoneUpdate) =>
    apiClient.put<Milestone>(`/projects/milestones/${milestoneId}`, data),

  /**
   * Delete milestone
   *
   * @param milestoneId Milestone ID
   * @returns Success response
   */
  deleteMilestone: (milestoneId: number) =>
    apiClient.delete<{ message: string }>(`/projects/milestones/${milestoneId}`),

  // ==================== Environmental Metrics ====================

  /**
   * Get project environmental metrics
   *
   * @param projectId Project ID
   * @returns Array of environmental metrics
   */
  getEnvironmentalMetrics: (projectId: number) =>
    apiClient.get<EnvironmentalMetric[]>(`/projects/${projectId}/metrics`),

  /**
   * Create environmental metric for project
   *
   * @param data Environmental metric data (includes project_id)
   * @returns Created metric
   */
  createEnvironmentalMetric: (data: EnvironmentalMetricCreate) =>
    apiClient.post<EnvironmentalMetric>(`/projects/${data.project_id}/metrics`, data),

  /**
   * Update environmental metric
   *
   * @param metricId Metric ID
   * @param data Metric update data
   * @returns Updated metric
   */
  updateEnvironmentalMetric: (metricId: number, data: EnvironmentalMetricUpdate) =>
    apiClient.put<EnvironmentalMetric>(`/projects/metrics/${metricId}`, data),

  /**
   * Delete environmental metric
   *
   * @param metricId Metric ID
   * @returns Success response
   */
  deleteEnvironmentalMetric: (metricId: number) =>
    apiClient.delete<{ message: string }>(`/projects/metrics/${metricId}`),

  // ==================== v2.0 Paginated Endpoints ====================

  /**
   * Get paginated tasks for a project (v2.0)
   *
   * @param projectId Project ID
   * @param params Query parameters (page, page_size, status, priority, suitable_for_volunteers)
   * @returns Paginated list of tasks
   */
  getProjectTasks: (
    projectId: number,
    params?: {
      page?: number;
      page_size?: number;
      status?: string;
      priority?: string;
      suitable_for_volunteers?: boolean;
    }
  ) =>
    apiClient.get<PaginatedResponse<TaskSummary>>(`/projects/${projectId}/tasks`, params),

  /**
   * Get paginated volunteers for a project (v2.0)
   *
   * @param projectId Project ID
   * @param params Query parameters (page, page_size)
   * @returns Paginated list of volunteers
   */
  getProjectVolunteers: (
    projectId: number,
    params?: {
      page?: number;
      page_size?: number;
    }
  ) =>
    apiClient.get<PaginatedResponse<VolunteerSummary>>(`/projects/${projectId}/volunteers`, params),

  /**
   * Get paginated resources allocated to a project (v2.0)
   *
   * @param projectId Project ID
   * @param params Query parameters (page, page_size)
   * @returns Paginated list of resource allocations
   */
  getProjectResources: (
    projectId: number,
    params?: {
      page?: number;
      page_size?: number;
    }
  ) =>
    apiClient.get<PaginatedResponse<ResourceAllocation>>(`/projects/${projectId}/resources`, params),

  /**
   * Get paginated activity log for a project (v2.0)
   *
   * @param projectId Project ID
   * @param params Query parameters (page, page_size, action_filter)
   * @returns Paginated list of activity logs
   */
  getProjectActivity: (
    projectId: number,
    params?: {
      page?: number;
      page_size?: number;
      action_filter?: string;
    }
  ) =>
    apiClient.get<PaginatedResponse<ActivityLog>>(`/projects/${projectId}/activity`, params),
};
