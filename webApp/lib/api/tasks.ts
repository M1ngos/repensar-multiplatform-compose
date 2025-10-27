/**
 * Tasks API Methods
 *
 * Handles all task-related endpoints including:
 * - Tasks CRUD
 * - Dependencies management
 * - Volunteer assignments
 * - Task statistics
 */

import { apiClient } from './client';
import type {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskSummary,
  TaskDetail,
  TaskStats,
  TaskQueryParams,
  TaskDependency,
  TaskDependencyCreate,
  TaskVolunteerAssignment,
} from './types';

export const tasksApi = {
  // ==================== Tasks CRUD ====================

  /**
   * Get list of tasks with optional filtering
   *
   * @param params Query parameters for filtering and pagination
   * @returns Array of task summaries
   */
  getTasks: (params?: TaskQueryParams) =>
    apiClient.get<TaskSummary[]>('/tasks/', params),

  /**
   * Get detailed task information
   *
   * @param taskId Task ID
   * @returns Detailed task information
   */
  getTask: (taskId: number) =>
    apiClient.get<TaskDetail>(`/tasks/${taskId}`),

  /**
   * Create a new task
   *
   * @param data Task creation data
   * @returns Created task
   */
  createTask: (data: TaskCreate) =>
    apiClient.post<Task>('/tasks/', data),

  /**
   * Update existing task
   *
   * @param taskId Task ID
   * @param data Task update data
   * @returns Updated task
   */
  updateTask: (taskId: number, data: TaskUpdate) =>
    apiClient.put<Task>(`/tasks/${taskId}`, data),

  /**
   * Delete task
   *
   * @param taskId Task ID
   * @returns Success response
   */
  deleteTask: (taskId: number) =>
    apiClient.delete<{ message: string }>(`/tasks/${taskId}`),

  // ==================== Task Statistics ====================

  /**
   * Get task statistics
   *
   * @returns Aggregated task statistics
   */
  getTasksStats: () =>
    apiClient.get<TaskStats>('/tasks/stats'),

  // ==================== Task Dependencies ====================

  /**
   * Get task dependencies
   *
   * @param taskId Task ID
   * @returns Array of task dependencies
   */
  getTaskDependencies: (taskId: number) =>
    apiClient.get<TaskDependency[]>(`/tasks/${taskId}/dependencies`),

  /**
   * Add task dependency
   *
   * @param taskId Task ID (successor)
   * @param data Dependency data
   * @returns Created dependency
   */
  addTaskDependency: (taskId: number, data: TaskDependencyCreate) =>
    apiClient.post<TaskDependency>(`/tasks/${taskId}/dependencies`, data),

  /**
   * Remove task dependency
   *
   * @param dependencyId Dependency ID
   * @returns Success response
   */
  removeTaskDependency: (dependencyId: number) =>
    apiClient.delete<{ message: string }>(`/tasks/dependencies/${dependencyId}`),

  // ==================== Volunteer Assignments ====================

  /**
   * Get task volunteer assignments
   *
   * @param taskId Task ID
   * @returns Array of volunteer assignments
   */
  getTaskVolunteers: (taskId: number) =>
    apiClient.get<TaskVolunteerAssignment[]>(`/tasks/${taskId}/volunteers`),

  /**
   * Assign volunteer to task
   *
   * @param taskId Task ID
   * @param data Volunteer assignment data (volunteer_id and optional role_description)
   * @returns Created assignment
   */
  assignVolunteer: (taskId: number, data: { volunteer_id: number; role_description?: string }) =>
    apiClient.post<TaskVolunteerAssignment>(`/tasks/${taskId}/assign-volunteer`, data),

  /**
   * Remove volunteer from task
   *
   * @param taskId Task ID
   * @param volunteerId Volunteer ID
   * @returns Success response
   */
  removeVolunteer: (taskId: number, volunteerId: number) =>
    apiClient.delete<{ message: string }>(`/tasks/${taskId}/volunteers/${volunteerId}`),

  /**
   * Get available volunteers for task assignment
   *
   * @returns Array of available volunteers
   */
  getAvailableVolunteers: () =>
    apiClient.get<any[]>('/tasks/volunteers/available'),

  /**
   * Get volunteer's task assignments
   *
   * @param volunteerId Volunteer ID
   * @returns Array of task assignments
   */
  getVolunteerAssignments: (volunteerId: number) =>
    apiClient.get<TaskVolunteerAssignment[]>(`/tasks/volunteers/${volunteerId}/assignments`),
};
