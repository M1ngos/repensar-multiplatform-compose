/**
 * Repensar Multiplatform API Client
 *
 * Production-grade TypeScript client for the Repensar backend API
 *
 * @example
 * ```typescript
 * import { api, authApi, volunteersApi, projectsApi, tasksApi } from '@/lib/api';
 *
 * // Login
 * const token = await authApi.login({ email: 'user@example.com', password: 'password' });
 *
 * // Get volunteers
 * const volunteers = await volunteersApi.getVolunteers({ status: VolunteerStatus.ACTIVE });
 *
 * // Create project
 * const project = await projectsApi.create({
 *   name: 'Reforestation Project',
 *   category: ProjectCategory.REFORESTATION
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
import { volunteersApi } from './volunteers';
import { projectsApi } from './projects';
import { tasksApi } from './tasks';

// Export API modules
export { authApi, volunteersApi, projectsApi, tasksApi };

// Export middleware
export {
  loggingInterceptor,
  performanceInterceptor,
  errorHandlerInterceptor,
  customHeadersInterceptor,
  csrfInterceptor,
  timeoutInterceptor,
  retryInterceptor,
  deduplicationInterceptor,
  authErrorInterceptor,
} from './middleware';

// Export all types and enums
export * from './types';

// Unified API object for convenience
export const api = {
  auth: authApi,
  volunteers: volunteersApi,
  projects: projectsApi,
  tasks: tasksApi,
};

// Default export
export default api;
