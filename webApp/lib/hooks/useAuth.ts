import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { authApi } from '../api/auth';
import { apiClient } from '../api/client';
import {
  UserProfile,
  LoginRequest,
  RegisterRequest,
  ChangePassword,
  PasswordResetRequest,
  PasswordReset,
  AuthStatus,
} from '../api/types';

export function useAuth() {
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR<UserProfile>('/auth/me', authApi.getProfile, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  });

  const {
    data: authStatus,
    mutate: mutateAuthStatus,
  } = useSWR<AuthStatus>('/auth/status', authApi.getAuthStatus, {
    shouldRetryOnError: false,
  });

  const loginMutation = useSWRMutation(
    '/auth/login',
    async (key: string, { arg }: { arg: LoginRequest }) => {
      const result = await authApi.login(arg);
      apiClient.setAuthToken(result.access_token);

      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', result.refresh_token);
      }

      await mutate();
      await mutateAuthStatus();
      return result;
    }
  );

  const registerMutation = useSWRMutation(
    '/auth/register',
    async (key: string, { arg }: { arg: RegisterRequest }) => {
      return authApi.register(arg);
    }
  );

  const logoutMutation = useSWRMutation('/auth/logout', async () => {
    await authApi.logout();
    apiClient.clearAuthToken();
    await mutate(undefined, false);
    await mutateAuthStatus();
  });

  const changePasswordMutation = useSWRMutation(
    '/auth/change-password',
    async (key: string, { arg }: { arg: ChangePassword }) => {
      return authApi.changePassword(arg);
    }
  );

  const forgotPasswordMutation = useSWRMutation(
    '/auth/forgot-password',
    async (key: string, { arg }: { arg: PasswordResetRequest }) => {
      return authApi.forgotPassword(arg);
    }
  );

  const resetPasswordMutation = useSWRMutation(
    '/auth/reset-password',
    async (key: string, { arg }: { arg: PasswordReset }) => {
      return authApi.resetPassword(arg);
    }
  );

  const isAuthenticated = !!user && !error;

  return {
    user,
    authStatus,
    isAuthenticated,
    isLoading,
    error,
    login: loginMutation.trigger,
    register: registerMutation.trigger,
    logout: logoutMutation.trigger,
    changePassword: changePasswordMutation.trigger,
    forgotPassword: forgotPasswordMutation.trigger,
    resetPassword: resetPasswordMutation.trigger,
    isLoginLoading: loginMutation.isMutating,
    isRegisterLoading: registerMutation.isMutating,
    isLogoutLoading: logoutMutation.isMutating,
    mutate,
  };
}