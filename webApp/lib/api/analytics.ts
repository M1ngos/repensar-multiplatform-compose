import { apiClient } from './client';
import type {
    MetricSnapshotCreate,
    TimeSeriesResponse,
    TimeSeriesQueryParams,
    AnalyticsDashboard,
    AnalyticsDashboardParams,
    VolunteerHoursTrends,
    ProjectProgressTrends,
    EnvironmentalImpactTrends,
    TrendsQueryParams,
    CustomDashboard,
    DashboardCreate,
    DashboardUpdate,
} from './types';

/**
 * Analytics API
 *
 * Provides time-series metrics, trends analysis, and dashboard analytics.
 *
 * API Specification Reference: Section 7 - Analytics
 */
export const analyticsApi = {
    // ==================== Metrics Management ====================

    /**
     * Create a metric snapshot for time-series tracking
     *
     * @param data Metric snapshot data
     * @returns Success response with snapshot ID
     *
     * **Endpoint:** POST /analytics/metrics/snapshot
     * **Authentication:** Bearer Token (admin, project_manager, staff_member)
     */
    createMetricSnapshot: (data: MetricSnapshotCreate) =>
        apiClient.post<{
            success: boolean;
            message: string;
            snapshot_id: number;
        }>('/analytics/metrics/snapshot', data),

    /**
     * Get time-series data for a specific metric type
     *
     * @param params Query parameters (metric_type, start_date, end_date, etc.)
     * @returns Time-series data with aggregated statistics
     *
     * **Endpoint:** GET /analytics/metrics/time-series
     * **Authentication:** Bearer Token
     */
    getTimeSeriesMetrics: (params: TimeSeriesQueryParams) =>
        apiClient.get<TimeSeriesResponse>('/analytics/metrics/time-series', params),

    // ==================== Dashboard ====================

    /**
     * Get aggregated analytics dashboard with KPIs
     *
     * @param params Optional parameters (project_id, start_date, end_date)
     * @returns Dashboard data with summary statistics
     *
     * **Endpoint:** GET /analytics/dashboard
     * **Authentication:** Bearer Token
     */
    getAnalyticsDashboard: (params?: AnalyticsDashboardParams) =>
        apiClient.get<AnalyticsDashboard>('/analytics/dashboard', params),

    // ==================== Trends ====================

    /**
     * Get volunteer hours trends over time
     *
     * @param params Query parameters (start_date, end_date, project_id, volunteer_id, granularity)
     * @returns Volunteer hours trends data
     *
     * **Endpoint:** GET /analytics/trends/volunteer-hours
     * **Authentication:** Bearer Token
     */
    getVolunteerHoursTrends: (params: TrendsQueryParams) =>
        apiClient.get<VolunteerHoursTrends>('/analytics/trends/volunteer-hours', params),

    /**
     * Get project progress trends over time
     *
     * @param projectId Project ID (required)
     * @param params Optional query parameters (start_date, end_date)
     * @returns Project progress trends data
     *
     * **Endpoint:** GET /analytics/trends/project-progress
     * **Authentication:** Bearer Token
     */
    getProjectProgressTrends: (
        projectId: number,
        params?: {
            start_date?: string;
            end_date?: string;
        }
    ) =>
        apiClient.get<ProjectProgressTrends>('/analytics/trends/project-progress', {
            project_id: projectId,
            ...params,
        }),

    /**
     * Get environmental impact metrics trends over time
     *
     * @param params Query parameters (project_id, metric_name, start_date, end_date)
     * @returns Environmental impact trends data
     *
     * **Endpoint:** GET /analytics/trends/environmental-impact
     * **Authentication:** Bearer Token
     */
    getEnvironmentalImpactTrends: (params?: {
        project_id?: number;
        metric_name?: string;
        start_date?: string;
        end_date?: string;
    }) =>
        apiClient.get<EnvironmentalImpactTrends>('/analytics/trends/environmental-impact', params),

    // ==================== Custom Dashboards ====================

    /**
     * Create a custom dashboard configuration
     *
     * @param data Dashboard creation data
     * @returns Success response
     *
     * **Endpoint:** POST /analytics/dashboards
     * **Authentication:** Bearer Token
     */
    createDashboard: (data: DashboardCreate) =>
        apiClient.post<{ message: string; dashboard_id: number }>('/analytics/dashboards', data),

    /**
     * Get all dashboards for the current user
     *
     * @returns List of user's dashboards
     *
     * **Endpoint:** GET /analytics/dashboards
     * **Authentication:** Bearer Token
     */
    getUserDashboards: () =>
        apiClient.get<{
            count: number;
            dashboards: CustomDashboard[];
        }>('/analytics/dashboards'),

    /**
     * Get a specific dashboard by ID
     *
     * @param dashboardId Dashboard ID
     * @returns Dashboard configuration
     *
     * **Endpoint:** GET /analytics/dashboards/{dashboard_id}
     * **Authentication:** Bearer Token
     */
    getDashboard: (dashboardId: number) =>
        apiClient.get<CustomDashboard>(`/analytics/dashboards/${dashboardId}`),

    /**
     * Update a dashboard configuration
     *
     * @param dashboardId Dashboard ID
     * @param data Update data
     * @returns Updated dashboard
     *
     * **Endpoint:** PUT /analytics/dashboards/{dashboard_id}
     * **Authentication:** Bearer Token
     */
    updateDashboard: (dashboardId: number, data: DashboardUpdate) =>
        apiClient.put<CustomDashboard>(`/analytics/dashboards/${dashboardId}`, data),

    /**
     * Delete a custom dashboard
     *
     * @param dashboardId Dashboard ID
     *
     * **Endpoint:** DELETE /analytics/dashboards/{dashboard_id}
     * **Authentication:** Bearer Token
     */
    deleteDashboard: (dashboardId: number) =>
        apiClient.delete<void>(`/analytics/dashboards/${dashboardId}`),

    /**
     * Set a dashboard as the default for the current user
     *
     * @param dashboardId Dashboard ID
     * @returns Success response
     *
     * **Endpoint:** POST /analytics/dashboards/{dashboard_id}/set-default
     * **Authentication:** Bearer Token
     */
    setDefaultDashboard: (dashboardId: number) =>
        apiClient.post<{ message: string }>(`/analytics/dashboards/${dashboardId}/set-default`),
};
