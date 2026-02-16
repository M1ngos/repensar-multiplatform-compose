/**
 * Contact API Methods
 *
 * Handles contact form submissions and admin management
 */

import { apiClient } from './client';
import type {
  ContactRequest,
  ContactResponse,
  ContactSubmission,
  ContactSubmissionsResponse,
  ContactSubmissionParams,
} from './types';

export const contactApi = {
  /**
   * Submit contact form (public endpoint)
   *
   * @param data Contact form data (name, email, message)
   * @returns Success message and submission ID
   */
  submitContact: (data: ContactRequest) =>
    apiClient.post<ContactResponse>('/contact', data, { skipAuth: true }),

  /**
   * List contact submissions (admin/staff only)
   *
   * @param params Query parameters for pagination and filtering
   * @returns List of contact submissions with pagination
   */
  listSubmissions: (params?: ContactSubmissionParams) => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.unread_only !== undefined)
      queryParams.append('unread_only', params.unread_only.toString());

    const query = queryParams.toString();
    return apiClient.get<ContactSubmissionsResponse>(
      `/contact/submissions${query ? `?${query}` : ''}`
    );
  },

  /**
   * Get a specific contact submission (admin/staff only)
   *
   * @param id Submission ID
   * @returns Contact submission details
   */
  getSubmission: (id: number) =>
    apiClient.get<ContactSubmission>(`/contact/submissions/${id}`),

  /**
   * Mark a contact submission as read (admin/staff only)
   *
   * @param id Submission ID
   * @returns Updated contact submission
   */
  markAsRead: (id: number) =>
    apiClient.patch<ContactSubmission>(`/contact/submissions/${id}/read`, {}),

  /**
   * Delete a contact submission (admin/staff only)
   *
   * @param id Submission ID
   * @returns Success response
   */
  deleteSubmission: (id: number) =>
    apiClient.delete<{ message: string }>(`/contact/submissions/${id}`),
};
