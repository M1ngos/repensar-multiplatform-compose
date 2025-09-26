import useSWR from 'swr';
import { authApi } from '../api/auth';

export function usePermissions() {
  const {
    data: permissions,
    error,
    isLoading,
    mutate,
  } = useSWR('/auth/permissions', authApi.getPermissions, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  });

  return {
    permissions,
    error,
    isLoading,
    mutate,
  };
}