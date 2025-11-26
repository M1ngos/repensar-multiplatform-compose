/**
 * Newsletter API Methods
 *
 * Handles newsletter subscription operations:
 * - Subscribe to newsletter
 * - Confirm subscription (double opt-in)
 * - Get unsubscribe info
 * - Confirm unsubscribe
 */

import { apiClient } from './client';
import type {
  NewsletterSubscribeRequest,
  NewsletterSubscribeResponse,
  NewsletterConfirmResponse,
  NewsletterUnsubscribeInfo,
  NewsletterUnsubscribeResponse,
} from './types';

export const newsletterApi = {
  /**
   * Subscribe to newsletter
   *
   * @param data Email and optional name
   * @returns Success message and confirmation requirement flag
   */
  subscribe: (data: NewsletterSubscribeRequest) =>
    apiClient.post<NewsletterSubscribeResponse>('/newsletter/subscribe', data, { skipAuth: true }),

  /**
   * Confirm newsletter subscription (double opt-in)
   *
   * @param token Confirmation token from email
   * @returns Success message and email
   */
  confirmSubscription: (token: string) =>
    apiClient.get<NewsletterConfirmResponse>(`/newsletter/confirm/${token}`, undefined, { skipAuth: true }),

  /**
   * Get unsubscribe information
   *
   * @param token Unsubscribe token from email
   * @returns Subscription info and confirmation message
   */
  getUnsubscribeInfo: (token: string) =>
    apiClient.get<NewsletterUnsubscribeInfo>(`/newsletter/unsubscribe/${token}`, undefined, { skipAuth: true }),

  /**
   * Confirm unsubscribe
   *
   * @param token Unsubscribe token
   * @returns Success message
   */
  confirmUnsubscribe: (token: string) =>
    apiClient.post<NewsletterUnsubscribeResponse>(`/newsletter/unsubscribe/${token}`, undefined, { skipAuth: true }),
};
