/**
 * Notifications API Methods
 *
 * Handles all notification-related endpoints including:
 * - Notifications CRUD
 * - Real-time SSE notifications
 * - Mark as read/unread
 * - Notification preferences
 */

import { apiClient } from './client';
import type {
  Notification,
  NotificationCreate,
  NotificationUpdate,
  NotificationQueryParams,
  PaginatedResponse,
} from './types';

export const notificationsApi = {
  // ==================== Notifications CRUD ====================

  /**
   * Get list of notifications with optional filtering
   *
   * @param params Query parameters for filtering and pagination
   * @returns Paginated list of notifications
   */
  getNotifications: (params?: NotificationQueryParams) =>
    apiClient.get<PaginatedResponse<Notification>>('/notifications', params),

  /**
   * Get a specific notification by ID
   *
   * @param id Notification ID
   * @returns Notification details
   */
  getNotification: (id: number) =>
    apiClient.get<Notification>(`/notifications/${id}`),

  /**
   * Get count of unread notifications
   *
   * @returns Count of unread notifications
   */
  getUnreadCount: () =>
    apiClient.get<{ count: number }>('/notifications/unread-count'),

  /**
   * Mark notification as read
   *
   * @param id Notification ID
   * @returns Updated notification
   */
  markAsRead: (id: number) =>
    apiClient.patch<Notification>(`/notifications/${id}/read`, {}),

  /**
   * Mark all notifications as read
   *
   * @returns Success message
   */
  markAllAsRead: () =>
    apiClient.post<{ message: string }>('/notifications/mark-all-read', {}),

  /**
   * Delete a notification
   *
   * @param id Notification ID
   * @returns Success message
   */
  deleteNotification: (id: number) =>
    apiClient.delete<{ message: string }>(`/notifications/${id}`),

  /**
   * Create a new notification (admin/system only)
   *
   * @param data Notification creation data
   * @returns Created notification
   */
  createNotification: (data: NotificationCreate) =>
    apiClient.post<Notification>('/notifications/create', data),
};

/**
 * Create SSE connection for real-time notifications
 *
 * @param token Access token for authentication
 * @param onNotification Callback when new notification received
 * @param onConnected Callback when connected
 * @param onError Callback when error occurs
 * @returns EventSource instance and cleanup function
 */
export function createNotificationStream(
  token: string,
  onNotification: (notification: Notification) => void,
  onConnected?: () => void,
  onError?: (error: Event) => void
): { eventSource: EventSource; cleanup: () => void } {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const url = `${baseUrl}/notifications/stream`;

  // Note: EventSource doesn't support custom headers directly
  // We'll need to pass the token as a query parameter
  const eventSource = new EventSource(`${url}?token=${token}`);

  eventSource.addEventListener('connected', (event) => {
    console.log('Connected to notification stream');
    onConnected?.();
  });

  eventSource.addEventListener('notification', (event) => {
    try {
      const notification: Notification = JSON.parse(event.data);
      onNotification(notification);
    } catch (error) {
      console.error('Failed to parse notification:', error);
    }
  });

  eventSource.addEventListener('error', (event) => {
    console.error('Notification stream error:', event);
    onError?.(event);
  });

  const cleanup = () => {
    eventSource.close();
  };

  return { eventSource, cleanup };
}
