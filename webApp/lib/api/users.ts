/**
 * Users API Module
 * Handles user management endpoints
 */

import { apiClient } from './client';
import type {
  UserDetail,
  UserSummary,
  UserUpdate,
  PaginatedResponse,
  UserType,
} from './types';

export interface UserQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  user_type_id?: number;
  is_active?: boolean;
  department?: string;
}

export const usersApi = {
  /**
   * Get paginated list of users (admin/staff only)
   * @route GET /users
   */
  getUsers: (params?: UserQueryParams) =>
    apiClient.get<PaginatedResponse<UserSummary>>('/users', params),

  /**
   * Get current user profile
   * @route GET /users/me
   */
  getCurrentUser: () =>
    apiClient.get<UserDetail>('/users/me'),

  /**
   * Get user by ID
   * @route GET /users/{user_id}
   */
  getUser: (userId: number) =>
    apiClient.get<UserDetail>(`/users/${userId}`),

  /**
   * Update user
   * @route PUT /users/{user_id}
   */
  updateUser: (userId: number, data: UserUpdate) =>
    apiClient.put<UserDetail>(`/users/${userId}`, data),

  /**
   * Activate user account (admin only)
   * @route POST /users/{user_id}/activate
   */
  activateUser: (userId: number) =>
    apiClient.post<{ message: string }>(`/users/${userId}/activate`),

  /**
   * Deactivate user account (admin only)
   * @route POST /users/{user_id}/deactivate
   */
  deactivateUser: (userId: number) =>
    apiClient.post<{ message: string }>(`/users/${userId}/deactivate`),

  /**
   * Get all user types
   * @route GET /users/types/all
   */
  getUserTypes: () =>
    apiClient.get<UserType[]>('/users/types/all'),

  /**
   * Get all departments
   * @route GET /users/departments/all
   */
  getDepartments: () =>
    apiClient.get<string[]>('/users/departments/all'),
};
