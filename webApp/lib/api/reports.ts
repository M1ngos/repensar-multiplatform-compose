import { apiClient } from './client';
import type {
    ProjectReport,
    ExportParams,
} from './types';

/**
 * Reports & Exports API
 *
 * Provides report generation and data export functionality (CSV, JSON).
 *
 * API Specification Reference: Section 8 - Reports & Exports
 */
export const reportsApi = {
    // ==================== Project Reports ====================

    /**
     * Get project reports
     *
     * @param params Query parameters (project_id optional)
     * @returns Project report data
     *
     * **Endpoint:** GET /reports/projects
     * **Authentication:** Bearer Token
     */
    getProjectReports: (params?: { project_id?: number }) =>
        apiClient.get<ProjectReport | ProjectReport[]>('/reports/projects', params),

    // ==================== CSV Exports ====================

    /**
     * Export projects to CSV file
     *
     * @param params Export parameters (status, category)
     * @returns CSV file blob
     *
     * **Endpoint:** GET /reports/export/projects/csv
     * **Authentication:** Bearer Token
     * **Response:** CSV file download
     */
    exportProjectsCSV: async (params?: ExportParams): Promise<Blob> => {
        const response = await fetch(
            `${apiClient.getBaseURL()}/reports/export/projects/csv?${new URLSearchParams(params as any).toString()}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Export failed');
        }

        return response.blob();
    },

    /**
     * Export volunteers to CSV file
     *
     * @param params Export parameters (volunteer_status)
     * @returns CSV file blob
     *
     * **Endpoint:** GET /reports/export/volunteers/csv
     * **Authentication:** Bearer Token (admin, project_manager, staff_member)
     * **Response:** CSV file download
     */
    exportVolunteersCSV: async (params?: ExportParams): Promise<Blob> => {
        const response = await fetch(
            `${apiClient.getBaseURL()}/reports/export/volunteers/csv?${new URLSearchParams(params as any).toString()}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Export failed');
        }

        return response.blob();
    },

    /**
     * Export tasks to CSV file
     *
     * @param params Export parameters (project_id, status)
     * @returns CSV file blob
     *
     * **Endpoint:** GET /reports/export/tasks/csv
     * **Authentication:** Bearer Token
     * **Response:** CSV file download
     */
    exportTasksCSV: async (params?: ExportParams): Promise<Blob> => {
        const response = await fetch(
            `${apiClient.getBaseURL()}/reports/export/tasks/csv?${new URLSearchParams(params as any).toString()}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Export failed');
        }

        return response.blob();
    },

    /**
     * Export time logs to CSV file
     *
     * @param params Export parameters (project_id, volunteer_id, start_date, end_date, approval_status)
     * @returns CSV file blob
     *
     * **Endpoint:** GET /reports/export/time-logs/csv
     * **Authentication:** Bearer Token (admin, project_manager, staff_member)
     * **Response:** CSV file download
     */
    exportTimeLogsCSV: async (params?: ExportParams): Promise<Blob> => {
        const response = await fetch(
            `${apiClient.getBaseURL()}/reports/export/time-logs/csv?${new URLSearchParams(params as any).toString()}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Export failed');
        }

        return response.blob();
    },

    // ==================== JSON Exports ====================

    /**
     * Export projects to JSON file
     *
     * @param params Export parameters (project_id, status)
     * @returns JSON file blob
     *
     * **Endpoint:** GET /reports/export/projects/json
     * **Authentication:** Bearer Token
     * **Response:** JSON file download
     */
    exportProjectsJSON: async (params?: ExportParams): Promise<Blob> => {
        const response = await fetch(
            `${apiClient.getBaseURL()}/reports/export/projects/json?${new URLSearchParams(params as any).toString()}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Export failed');
        }

        return response.blob();
    },

    /**
     * Export volunteers to JSON file
     *
     * @param params Export parameters (volunteer_status)
     * @returns JSON file blob
     *
     * **Endpoint:** GET /reports/export/volunteers/json
     * **Authentication:** Bearer Token (admin, project_manager, staff_member)
     * **Response:** JSON file download
     */
    exportVolunteersJSON: async (params?: ExportParams): Promise<Blob> => {
        const response = await fetch(
            `${apiClient.getBaseURL()}/reports/export/volunteers/json?${new URLSearchParams(params as any).toString()}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Export failed');
        }

        return response.blob();
    },

    /**
     * Export tasks to JSON file
     *
     * @param params Export parameters (project_id, status)
     * @returns JSON file blob
     *
     * **Endpoint:** GET /reports/export/tasks/json
     * **Authentication:** Bearer Token
     * **Response:** JSON file download
     */
    exportTasksJSON: async (params?: ExportParams): Promise<Blob> => {
        const response = await fetch(
            `${apiClient.getBaseURL()}/reports/export/tasks/json?${new URLSearchParams(params as any).toString()}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Export failed');
        }

        return response.blob();
    },

    /**
     * Export time logs to JSON file
     *
     * @param params Export parameters (project_id, volunteer_id, start_date, end_date, approval_status)
     * @returns JSON file blob
     *
     * **Endpoint:** GET /reports/export/time-logs/json
     * **Authentication:** Bearer Token (admin, project_manager, staff_member)
     * **Response:** JSON file download
     */
    exportTimeLogsJSON: async (params?: ExportParams): Promise<Blob> => {
        const response = await fetch(
            `${apiClient.getBaseURL()}/reports/export/time-logs/json?${new URLSearchParams(params as any).toString()}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Export failed');
        }

        return response.blob();
    },

    // ==================== Utility Functions ====================

    /**
     * Download a blob as a file
     *
     * @param blob File blob
     * @param filename Filename for download
     */
    downloadBlob: (blob: Blob, filename: string) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },

    /**
     * Generate a filename for export with timestamp
     *
     * @param prefix Filename prefix (e.g., 'projects', 'volunteers')
     * @param format File format (e.g., 'csv', 'json')
     * @returns Formatted filename
     */
    generateFilename: (prefix: string, format: string): string => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        return `${prefix}_export_${timestamp}.${format}`;
    },
};
