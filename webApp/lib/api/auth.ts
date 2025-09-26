import { apiClient } from './client';
import {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  Token,
  UserProfile,
  ChangePassword,
  PasswordResetRequest,
  PasswordReset,
  ResendVerificationRequest,
  AuthStatus,
} from './types';

export const authApi = {
  validateToken: () => apiClient.get<any>('/auth/validate-token'),

  login: (data: LoginRequest) => apiClient.post<Token>('/auth/login', data),

  register: (data: RegisterRequest) =>
    apiClient.post<{ message: string }>('/auth/register', data),

  refreshToken: (data: RefreshTokenRequest) =>
    apiClient.post<Token>('/auth/refresh', data),

  logout: () => apiClient.post<{}>('/auth/logout'),

  getProfile: () => apiClient.get<UserProfile>('/auth/me'),

  changePassword: (data: ChangePassword) =>
    apiClient.post<{}>('/auth/change-password', data),

  forgotPassword: (data: PasswordResetRequest) =>
    apiClient.post<{}>('/auth/forgot-password', data),

  resetPassword: (data: PasswordReset) =>
    apiClient.post<{}>('/auth/reset-password', data),

  verifyEmail: (token: string) =>
    apiClient.post<{}>(`/auth/verify-email?token=${token}`),

  resendVerification: (data: ResendVerificationRequest) =>
    apiClient.post<{}>('/auth/resend-verification', data),

  getAuthStatus: () => apiClient.get<AuthStatus>('/auth/status'),

  getPermissions: () => apiClient.get<any>('/auth/permissions'),
};