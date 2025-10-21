/**
 * Authentication API Methods
 *
 * Handles all authentication-related endpoints including:
 * - Login/Logout
 * - Registration
 * - Token refresh
 * - Password management
 * - Email verification
 * - User profile
 * - Permissions
 */

import { apiClient } from './client';
import type {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  Token,
  UserProfile,
  ChangePassword,
  PasswordResetRequest,
  PasswordReset,
  ResendVerificationRequest,
  UserPermissions,
  AuditLogEntry,
  GoogleOAuthUrlResponse,
  GoogleOAuthCallbackRequest,
} from './types';

export const authApi = {
  /**
   * Login with email and password
   *
   * Features:
   * - Rate limiting by IP address
   * - Account lockout after failed attempts
   * - Audit logging
   * - Token rotation with family tracking
   *
   * @param data Login credentials
   * @returns JWT access and refresh tokens
   */
  login: async (data: LoginRequest): Promise<Token> => {
    const token = await apiClient.post<Token>('/auth/login', data, { skipAuth: true });
    apiClient.setAuthToken(token);
    return token;
  },

  /**
   * Register a new user account
   *
   * Features:
   * - Rate limiting (3 per hour per IP)
   * - Email uniqueness validation
   * - Password strength validation
   * - Email verification token generation
   * - Audit logging
   *
   * @param data Registration details
   * @returns Success message
   */
  register: async (data: RegisterRequest) => {
    console.log('[authApi] Registering user with data:', data);
    console.log('[authApi] API Base URL:', apiClient.getBaseURL());
    try {
      const result = await apiClient.post<{ message: string }>('/auth/register', data, { skipAuth: true });
      console.log('[authApi] Registration response:', result);
      return result;
    } catch (error) {
      console.error('[authApi] Registration error:', error);
      throw error;
    }
  },

  /**
   * Refresh access token using refresh token
   *
   * Features:
   * - Token rotation (new refresh token on each use)
   * - Reuse detection (revokes entire family if reused)
   * - Rate limiting
   * - Audit logging
   *
   * @param data Refresh token
   * @returns New JWT access and refresh tokens
   */
  refreshToken: async (data: RefreshTokenRequest): Promise<Token> => {
    const token = await apiClient.post<Token>('/auth/refresh', data, { skipAuth: true });
    apiClient.setAuthToken(token);
    return token;
  },

  /**
   * Logout and revoke all tokens for current user
   *
   * Features:
   * - Revokes all tokens for the user
   * - Audit logging
   */
  logout: async (): Promise<void> => {
    await apiClient.post<{}>('/auth/logout');
    apiClient.clearAuthToken();
  },

  /**
   * Logout from all devices by revoking all tokens
   *
   * Features:
   * - Revokes all tokens across all devices
   * - Audit logging
   */
  logoutAllDevices: async (): Promise<void> => {
    await apiClient.post<{}>('/auth/logout-all-devices');
    apiClient.clearAuthToken();
  },

  /**
   * Get current user profile
   *
   * @returns User profile information
   */
  getProfile: () =>
    apiClient.get<UserProfile>('/auth/me'),

  /**
   * Validate current JWT token and return user info
   *
   * Does not require active user (just valid token)
   *
   * @returns User information if token is valid
   */
  validateToken: () =>
    apiClient.get<{ valid: boolean; user?: UserProfile }>('/auth/validate-token'),

  /**
   * Get user permissions and dashboard configuration
   *
   * Returns user type, permissions, and dashboard config
   *
   * @returns User permissions and configuration
   */
  getPermissions: () =>
    apiClient.get<UserPermissions>('/auth/permissions'),

  /**
   * Get audit log for the current user
   *
   * Note: In production, this should be restricted to admins or
   * implement proper authorization
   *
   * @param limit Maximum number of entries to return (default: 50)
   * @returns Array of audit log entries
   */
  getAuditLog: (limit: number = 50) =>
    apiClient.get<AuditLogEntry[]>('/auth/audit-log', { limit }),

  /**
   * Verify user email address
   *
   * Features:
   * - Token validation
   * - Expiration checking
   * - Audit logging
   *
   * @param token Verification token from email
   * @returns Success message
   */
  verifyEmail: (token: string) =>
    apiClient.post<{ message: string }>(`/auth/verify-email?token=${token}`, undefined, { skipAuth: true }),

  /**
   * Resend email verification link
   *
   * Features:
   * - Email enumeration protection
   * - Already verified check
   * - Token regeneration
   * - Audit logging
   *
   * @param data Email address
   * @returns Success message
   */
  resendVerification: (data: ResendVerificationRequest) =>
    apiClient.post<{ message: string }>('/auth/resend-verification', data, { skipAuth: true }),

  /**
   * Request password reset link
   *
   * Features:
   * - Rate limiting (3 per hour)
   * - Email enumeration protection
   * - Secure token generation
   * - Audit logging
   *
   * @param data Email address
   * @returns Success message
   */
  forgotPassword: (data: PasswordResetRequest) =>
    apiClient.post<{ message: string }>('/auth/forgot-password', data, { skipAuth: true }),

  /**
   * Reset password using reset token
   *
   * Features:
   * - Token validation
   * - Expiration checking
   * - Token revocation (all refresh tokens)
   * - Audit logging
   *
   * @param data Reset token and new password
   * @returns Success message
   */
  resetPassword: (data: PasswordReset) =>
    apiClient.post<{ message: string }>('/auth/reset-password', data, { skipAuth: true }),

  /**
   * Change password for authenticated user
   *
   * Features:
   * - Current password verification
   * - Password strength validation
   * - Token revocation (all refresh tokens)
   * - Audit logging
   *
   * @param data Current and new password
   * @returns Success message
   */
  changePassword: (data: ChangePassword) =>
    apiClient.post<{ message: string }>('/auth/change-password', data),

  /**
   * Get Google OAuth authorization URL
   *
   * Features:
   * - OAuth 2.0 compliant
   * - CSRF protection with state token
   * - Returns authorization URL to redirect user
   *
   * @returns Authorization URL and state token
   * @throws 503 if Google OAuth is not configured on server
   */
  googleLogin: async (): Promise<GoogleOAuthUrlResponse> => {
    return apiClient.get<GoogleOAuthUrlResponse>('/auth/google/login', undefined, { skipAuth: true });
  },

  /**
   * Handle Google OAuth callback and authenticate user
   *
   * Features:
   * - Exchanges authorization code for tokens
   * - Automatic user creation for new Google users
   * - Profile picture import
   * - Email verification handled automatically
   * - JWT token generation
   *
   * @param data Authorization code and state from Google
   * @returns JWT access and refresh tokens
   * @throws 400 if code is invalid or user info fetch fails
   * @throws 500 if server configuration error
   */
  googleCallback: async (data: GoogleOAuthCallbackRequest): Promise<Token> => {
    const token = await apiClient.post<Token>('/auth/google/callback', data, { skipAuth: true });
    apiClient.setAuthToken(token);
    return token;
  },
};
