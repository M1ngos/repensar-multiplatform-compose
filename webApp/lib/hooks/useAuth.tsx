
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { authApi } from '@/lib/api/auth';
import { LoginRequest, RegisterRequest, UserProfile } from '@/lib/api/types';
import { apiClient } from '@/lib/api/client';
import { usePathname, useRouter } from '@/src/i18n/navigation.ts';

interface AuthState {
  user: UserProfile | null;
  authStatus: { is_authenticated: boolean };
  isAuthLoading: boolean;
  isLoginLoading: boolean;
  isRegisterLoading: boolean;
  isLogoutLoading: boolean;
  isGoogleLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  googleSignIn: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authStatus, setAuthStatus] = useState({ is_authenticated: false });
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async () => {
    setIsAuthLoading(true);
    setError(null);
    try {
      if (apiClient.isAuthenticated()) {
        const { valid, user: validatedUser } = await authApi.validateToken();
        if (valid && validatedUser) {
          setUser(validatedUser);
          setAuthStatus({ is_authenticated: true });
        } else {
          throw new Error('Token validation failed');
        }
      } else {
        throw new Error('No token found');
      }
    } catch (err: any) {
      setUser(null);
      setAuthStatus({ is_authenticated: false });
      apiClient.clearAuthToken();
      if (err.message !== 'No token found') {
        setError('Session expired. Please log in again.');
      }
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  // Initial authentication check on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Periodic token validation (every 5 minutes)
  useEffect(() => {
    const VALIDATION_INTERVAL = 5 * 60 * 1000; // 5 minutes

    const interval = setInterval(() => {
      // Only validate if we have a token
      if (apiClient.isAuthenticated()) {
        checkAuth();
      }
    }, VALIDATION_INTERVAL);

    return () => clearInterval(interval);
  }, [checkAuth]);

  // Revalidate token when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && apiClient.isAuthenticated()) {
        checkAuth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkAuth]);

  const login = async (data: LoginRequest) => {
    setIsLoginLoading(true);
    setError(null);
    try {
      await authApi.login(data);
      await checkAuth();
    } catch (err: any) {
      setError(err.detail || 'Login failed');
      throw err;
    } finally {
      setIsLoginLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsRegisterLoading(true);
    setError(null);
    console.log('[useAuth] Starting registration with data:', data);
    try {
      const result = await authApi.register(data);
      console.log('[useAuth] Registration result:', result);
    } catch (err: any) {
      console.error('[useAuth] Registration failed:', err);
      setError(err.detail || 'Registration failed');
      throw err;
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const logout = async () => {
    setIsLogoutLoading(true);
    setError(null);
    try {
      await authApi.logout();
      setUser(null);
      setAuthStatus({ is_authenticated: false });
      // Redirect to home after logout
      router.push('/');
    } catch (err: any) {
      setError(err.detail || 'Logout failed');
    } finally {
      setIsLogoutLoading(false);
    }
  };

  const googleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const { authorization_url, state } = await authApi.googleLogin();

      // Store state in sessionStorage for validation (optional but recommended)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('oauth_state', state);
      }

      // Redirect to Google
      window.location.href = authorization_url;
    } catch (err: any) {
      setError(err.detail || 'Failed to initiate Google Sign In');
      setIsGoogleLoading(false);
      throw err;
    }
    // Note: We don't set isGoogleLoading to false here because we're redirecting
  };

  const value = {
    user,
    authStatus,
    isAuthLoading,
    isLoginLoading,
    isRegisterLoading,
    isLogoutLoading,
    isGoogleLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
    googleSignIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
