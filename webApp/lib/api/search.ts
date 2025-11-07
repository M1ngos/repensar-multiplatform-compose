/**
 * Search API Methods
 *
 * Handles all search-related endpoints including:
 * - Global search across all entities
 * - Entity-specific search
 */

import { apiClient } from './client';
import type {
  ProjectSummary,
  TaskSummary,
  VolunteerSummary,
} from './types';

export interface SearchResults {
  projects: ProjectSummary[];
  tasks: TaskSummary[];
  volunteers: VolunteerSummary[];
}

export interface SearchParams {
  q: string;
  limit?: number;
}

export const searchApi = {
  /**
   * Global search across all entities
   *
   * @param params Search query parameters
   * @returns Search results from all entities
   */
  globalSearch: (params: SearchParams) =>
    apiClient.get<SearchResults>('/search', params),

  /**
   * Search projects only
   *
   * @param params Search query parameters
   * @returns Project search results
   */
  searchProjects: (params: SearchParams) =>
    apiClient.get<ProjectSummary[]>('/search/projects', params),

  /**
   * Search tasks only
   *
   * @param params Search query parameters
   * @returns Task search results
   */
  searchTasks: (params: SearchParams) =>
    apiClient.get<TaskSummary[]>('/search/tasks', params),

  /**
   * Search volunteers only
   *
   * @param params Search query parameters
   * @returns Volunteer search results
   */
  searchVolunteers: (params: SearchParams) =>
    apiClient.get<VolunteerSummary[]>('/search/volunteers', params),
};
