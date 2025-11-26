/**
 * Contact API Methods
 *
 * Handles contact form submissions
 */

import { apiClient } from './client';
import type { ContactRequest, ContactResponse } from './types';

export const contactApi = {
  /**
   * Submit contact form
   *
   * @param data Contact form data (name, email, message)
   * @returns Success message and submission ID
   */
  submitContact: (data: ContactRequest) =>
    apiClient.post<ContactResponse>('/contact', data, { skipAuth: true }),
};
