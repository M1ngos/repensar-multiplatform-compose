
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
import { LoginRequest, UserProfile } from '@/lib/api/types';
import { apiClient } from '@/lib/api/client';
import { usePathname, useRouter } from '@/src/i18n/navigation.ts';

interface AuthState {
  user: UserProfile | null;
  authStatus: { is_authenticated: boolean };
  isAuthLoading: boolean;
  isLoginLoading: boolean;
  isLogoutLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authStatus, setAuthStatus] = useState({ is_authenticated: false });
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
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

  useEffect(() => {
    checkAuth();
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

  const value = {
    user,
    authStatus,
    isAuthLoading,
    isLoginLoading,
    isLogoutLoading,
    error,
    login,
    logout,
    checkAuth,
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
