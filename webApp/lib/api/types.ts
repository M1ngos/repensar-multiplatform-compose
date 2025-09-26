export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChangePassword {
  current_password: string;
  new_password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  new_password: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface AuthStatus {
  is_authenticated: boolean;
  user?: UserProfile;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

export interface ApiError {
  detail: string;
  status_code: number;
}