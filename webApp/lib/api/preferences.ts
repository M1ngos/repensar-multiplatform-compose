/**
 * User Preferences API Module
 * Handles user preferences and settings endpoints
 */

import { apiClient } from './client';
import type { UserPreferences, UserPreferencesUpdate } from './types';

export const preferencesApi = {
  /**
   * Get current user's preferences
   */
  getPreferences: () =>
    apiClient.get<UserPreferences>('/api/v1/preferences'),

  /**
   * Update all preferences (full replacement)
   */
  updatePreferences: (data: UserPreferencesUpdate) =>
    apiClient.put<UserPreferences>('/api/v1/preferences', data),

  /**
   * Partial update of preferences
   */
  patchPreferences: (data: UserPreferencesUpdate) =>
    apiClient.patch<UserPreferences>('/api/v1/preferences', data),
};
