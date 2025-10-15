/**
 * Production-grade API Client for Repensar Multiplatform Backend
 *
 * Features:
 * - Automatic token refresh on 401 errors
 * - Request/response interceptors
 * - Retry logic with exponential backoff
 * - Type-safe error handling
 * - Request deduplication
 * - Centralized authentication management
 */

import { ApiError, Token, RefreshTokenRequest } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  skipRetry?: boolean;
  retryCount?: number;
}

interface RequestInterceptor {
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  onResponse?: <T>(response: Response, data: T) => T | Promise<T>;
  onError?: (error: ApiError) => ApiError | Promise<ApiError>;
}

class ApiClient {
  private baseURL: string;
  private refreshTokenPromise: Promise<Token> | null = null;
  private interceptors: RequestInterceptor[] = [];
  private pendingRequests = new Map<string, Promise<any>>();

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Add request/response interceptor
   */
  public use(interceptor: RequestInterceptor): void {
    this.interceptors.push(interceptor);
  }

  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token from storage
   */
  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Check if token is expired or about to expire (within 60 seconds)
   */
  private isTokenExpired(): boolean {
    if (typeof window === 'undefined') return false;

    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return false;

    const expiryTime = parseInt(expiry, 10);
    const now = Date.now();
    const bufferTime = 60 * 1000; // 60 seconds buffer

    return now >= expiryTime - bufferTime;
  }

  /**
   * Set authentication tokens
   */
  public setAuthToken(token: Token): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(ACCESS_TOKEN_KEY, token.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, token.refresh_token);

    // Calculate expiry time (current time + expires_in seconds)
    const expiryTime = Date.now() + token.expires_in * 1000;
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  }

  /**
   * Clear authentication tokens
   */
  public clearAuthToken(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<Token> {
    // If refresh is already in progress, return that promise
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshTokenPromise = (async () => {
      try {
        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken } as RefreshTokenRequest),
        });

        if (!response.ok) {
          this.clearAuthToken();
          throw new Error('Token refresh failed');
        }

        const newToken = await response.json() as Token;
        this.setAuthToken(newToken);
        return newToken;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  /**
   * Build query string from params object
   */
  private buildQueryString(params?: Record<string, any>): string {
    if (!params) return '';

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Generate cache key for request deduplication
   */
  private getCacheKey(endpoint: string, options: RequestConfig): string {
    return `${options.method || 'GET'}:${endpoint}:${JSON.stringify(options.body || '')}`;
  }

  /**
   * Core request method with retry logic and token refresh
   */
  private async request<T>(
    endpoint: string,
    options: RequestConfig = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const {
      skipAuth = false,
      skipRetry = false,
      retryCount = 0,
      ...requestInit
    } = options;

    // Request deduplication for GET requests
    if (requestInit.method === 'GET' || !requestInit.method) {
      const cacheKey = this.getCacheKey(endpoint, options);
      const pendingRequest = this.pendingRequests.get(cacheKey);

      if (pendingRequest) {
        return pendingRequest;
      }
    }

    // Build headers
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if not skipped
    if (!skipAuth) {
      // Check if token is expired and refresh if needed
      if (this.isTokenExpired()) {
        try {
          await this.refreshAccessToken();
        } catch (error) {
          // If refresh fails, continue with current token
          // The 401 handler will catch it
        }
      }

      const token = this.getAuthToken();
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    let config: RequestConfig = {
      ...requestInit,
      headers: {
        ...defaultHeaders,
        ...requestInit.headers,
      },
    };

    // Apply request interceptors
    for (const interceptor of this.interceptors) {
      if (interceptor.onRequest) {
        config = await interceptor.onRequest(config);
      }
    }

    const makeRequest = async (): Promise<T> => {
      try {
        const response = await fetch(url, config);

        // Handle 401 Unauthorized - try to refresh token
        if (response.status === 401 && !skipAuth && !skipRetry) {
          try {
            await this.refreshAccessToken();
            // Retry the request with new token
            return this.request<T>(endpoint, {
              ...options,
              skipRetry: true, // Prevent infinite retry loop
            });
          } catch (refreshError) {
            // Refresh failed, clear tokens and throw error
            this.clearAuthToken();
            throw {
              detail: 'Authentication failed',
              status_code: 401,
            } as ApiError;
          }
        }

        // Handle error responses
        if (!response.ok) {
          let errorDetail: string;
          try {
            const errorData = await response.json();
            errorDetail = errorData.detail || response.statusText;
          } catch {
            errorDetail = await response.text() || response.statusText;
          }

          let error: ApiError = {
            detail: errorDetail,
            status_code: response.status,
          };

          // Apply error interceptors
          for (const interceptor of this.interceptors) {
            if (interceptor.onError) {
              error = await interceptor.onError(error);
            }
          }

          throw error;
        }

        // Parse response
        const contentType = response.headers.get('content-type');
        let data: T;

        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = {} as T;
        }

        // Apply response interceptors
        for (const interceptor of this.interceptors) {
          if (interceptor.onResponse) {
            data = await interceptor.onResponse(response, data);
          }
        }

        return data;
      } catch (error) {
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          const apiError: ApiError = {
            detail: 'Network error. Please check your connection.',
            status_code: 0,
          };

          // Apply error interceptors
          let finalError = apiError;
          for (const interceptor of this.interceptors) {
            if (interceptor.onError) {
              finalError = await interceptor.onError(finalError);
            }
          }

          throw finalError;
        }

        // Re-throw if already an ApiError
        if (typeof error === 'object' && error !== null && 'status_code' in error) {
          throw error;
        }

        // Wrap unknown errors
        throw {
          detail: error instanceof Error ? error.message : 'Unknown error',
          status_code: 0,
        } as ApiError;
      }
    };

    // Create promise for this request
    const requestPromise = makeRequest();

    // Cache GET requests for deduplication
    if (requestInit.method === 'GET' || !requestInit.method) {
      const cacheKey = this.getCacheKey(endpoint, options);
      this.pendingRequests.set(cacheKey, requestPromise);

      // Clean up after request completes
      requestPromise.finally(() => {
        this.pendingRequests.delete(cacheKey);
      });
    }

    return requestPromise;
  }

  /**
   * GET request
   */
  public async get<T>(endpoint: string, params?: Record<string, any>, config?: RequestConfig): Promise<T> {
    const queryString = this.buildQueryString(params);
    return this.request<T>(`${endpoint}${queryString}`, {
      ...config,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  public async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  public async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  public async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  public async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'DELETE',
    });
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  /**
   * Get base URL
   */
  public getBaseURL(): string {
    return this.baseURL;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or multiple instances
export { ApiClient };
export type { RequestConfig, RequestInterceptor };
