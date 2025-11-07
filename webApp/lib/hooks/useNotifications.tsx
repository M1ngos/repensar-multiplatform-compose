'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationsApi, createNotificationStream } from '@/lib/api/notifications';
import type { Notification } from '@/lib/api/types';
import { toast } from 'sonner';

interface UseNotificationsOptions {
  enableSSE?: boolean;
  enableToasts?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { enableSSE = false, enableToasts = true } = options; // SSE disabled by default until backend is ready
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await notificationsApi.getNotifications({
        page: 1,
        page_size: 20,
      });
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationsApi.getUnreadCount();
      setUnreadCount(response.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      setUnreadCount(0); // Set to 0 on error
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id: number) => {
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === id);
        return notification && !notification.is_read ? Math.max(0, prev - 1) : prev;
      });
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  }, [notifications]);

  // Handle new notification from SSE
  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    if (enableToasts) {
      const toastOptions = {
        duration: 5000,
      };

      switch (notification.type) {
        case 'success':
          toast.success(notification.title, {
            description: notification.message,
            ...toastOptions,
          });
          break;
        case 'error':
          toast.error(notification.title, {
            description: notification.message,
            ...toastOptions,
          });
          break;
        case 'warning':
          toast.warning(notification.title, {
            description: notification.message,
            ...toastOptions,
          });
          break;
        default:
          toast.info(notification.title, {
            description: notification.message,
            ...toastOptions,
          });
      }
    }
  }, [enableToasts]);

  // Setup SSE connection
  useEffect(() => {
    if (!enableSSE) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('No access token found for notifications SSE');
      return;
    }

    try {
      const { eventSource, cleanup } = createNotificationStream(
        token,
        handleNewNotification,
        () => setIsConnected(true),
        () => setIsConnected(false)
      );

      eventSourceRef.current = eventSource;
      cleanupRef.current = cleanup;

      return () => {
        cleanup();
      };
    } catch (error) {
      console.error('Failed to setup SSE connection:', error);
      setIsConnected(false);
    }
  }, [enableSSE, handleNewNotification]);

  // Initial fetch - with graceful degradation
  useEffect(() => {
    // Try to fetch, but don't block the app if it fails
    const init = async () => {
      await Promise.allSettled([
        fetchNotifications(),
        fetchUnreadCount(),
      ]);
    };
    init();
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
}
