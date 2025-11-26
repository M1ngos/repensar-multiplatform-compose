/**
 * Repensar Multiplatform API Client
 *
 * Production-grade TypeScript client for the Repensar backend API
 *
 * @example
 * ```typescript
 * import { api, authApi, projectsApi, analyticsApi } from '@/lib/api';
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
 *
 * // Get analytics dashboard
 * const dashboard = await analyticsApi.getAnalyticsDashboard();
 *
 * // Export data to CSV
 * const blob = await reportsApi.exportProjectsCSV({ status: 'completed' });
 * reportsApi.downloadBlob(blob, reportsApi.generateFilename('projects', 'csv'));
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
import { usersApi } from './users';
import { resourcesApi } from './resources';
import { analyticsApi } from './analytics';
import { reportsApi } from './reports';
import { blogApi } from './blog';
import { contactApi } from './contact';
import { newsletterApi } from './newsletter';

// Export API modules
export { authApi, projectsApi, tasksApi, volunteersApi, usersApi, resourcesApi, analyticsApi, reportsApi, blogApi, contactApi, newsletterApi };

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
  users: usersApi,
  resources: resourcesApi,
  analytics: analyticsApi,
  reports: reportsApi,
  blog: blogApi,
  contact: contactApi,
  newsletter: newsletterApi,
};

// Default export
export default api;
