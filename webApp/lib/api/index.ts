/**
 * Repensar Multiplatform API Client
 *
 * Production-grade TypeScript client for the Repensar backend API
 *
 * @example
 * ```typescript
 * import { api, authApi, projectsApi } from '@/lib/api';
 *
 * // Login
 * const token = await authApi.login({ email: 'user@example.com', password: 'password' });
 *
 * // Get projects
 * const projects = await projectsApi.getProjects({ status: 'in_progress' });
 *
 * // Create project
 * const project = await projectsApi.createProject({
 *   name: 'Reforestation Project',
 *   category: 'reforestation'
 * });
 * ```
 *
 * @see {@link https://github.com/your-org/repensar-backend} Backend API Documentation
 */

// Export API client
export { apiClient, ApiClient } from './client';
export type { RequestConfig, RequestInterceptor } from './client';

// Import API modules
import { authApi } from './auth';
import { projectsApi } from './projects';
import { tasksApi } from './tasks';
import { volunteersApi } from './volunteers';

// Export API modules
export { authApi, projectsApi, tasksApi, volunteersApi };

// Export middleware (when implemented)
// export {
//   loggingInterceptor,
//   performanceInterceptor,
//   errorHandlerInterceptor,
//   customHeadersInterceptor,
//   csrfInterceptor,
//   timeoutInterceptor,
//   retryInterceptor,
//   deduplicationInterceptor,
//   authErrorInterceptor,
// } from './middleware';

// Export all types and enums
export * from './types';

// Unified API object for convenience
export const api = {
  auth: authApi,
  projects: projectsApi,
  tasks: tasksApi,
  volunteers: volunteersApi,
};

// Default export
export default api;
