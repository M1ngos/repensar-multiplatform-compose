// lib/hooks/useNotificationPreferences.ts
/**
 * Hook to access user notification preferences from the API.
 * Returns preference checks that can be used to conditionally show toasts.
 */

import useSWR from 'swr';
import { preferencesApi } from '@/lib/api';

interface NotificationPreferences {
  in_app_all: boolean;
  in_app_task_updates: boolean;
  in_app_project_updates: boolean;
  in_app_gamification: boolean;
  isLoading: boolean;
  error: unknown;
  canShowTaskNotification: boolean;
  canShowProjectNotification: boolean;
  canShowGamificationNotification: boolean;
}

export function useNotificationPreferences(): NotificationPreferences {
  const { data, isLoading, error } = useSWR(
    'user-preferences',
    () => preferencesApi.getPreferences()
  );

  const in_app_all = data?.in_app_all ?? true;
  const in_app_task_updates = data?.in_app_task_updates ?? true;
  const in_app_project_updates = data?.in_app_project_updates ?? true;
  const in_app_gamification = data?.in_app_gamification ?? true;

  return {
    in_app_all,
    in_app_task_updates,
    in_app_project_updates,
    in_app_gamification,
    isLoading,
    error,
    canShowTaskNotification: in_app_all && in_app_task_updates,
    canShowProjectNotification: in_app_all && in_app_project_updates,
    canShowGamificationNotification: in_app_all && in_app_gamification,
  };
}

/**
 * Hook to conditionally show toasts based on user preferences.
 * Wraps toast calls to respect user settings.
 */
import { toast } from 'sonner';

export function useConditionalToast() {
  const prefs = useNotificationPreferences();

  const showTaskToast = (title: string, message: string) => {
    if (prefs.canShowTaskNotification && !prefs.isLoading) {
      toast.success(title, { description: message });
    }
  };

  const showProjectToast = (title: string, message: string) => {
    if (prefs.canShowProjectNotification && !prefs.isLoading) {
      toast.success(title, { description: message });
    }
  };

  const showGamificationToast = (title: string, message: string) => {
    if (prefs.canShowGamificationNotification && !prefs.isLoading) {
      toast.success(title, { description: message });
    }
  };

  const showGenericToast = (title: string, message: string) => {
    if (prefs.in_app_all && !prefs.isLoading) {
      toast.success(title, { description: message });
    }
  };

  return {
    showTaskToast,
    showProjectToast,
    showGamificationToast,
    showGenericToast,
    prefs,
  };
}