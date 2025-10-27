import { apiClient } from './client';
import type {
    Resource,
    ResourceCreate,
    ResourceAllocation,
    ResourceAllocationCreate,
    ResourceQueryParams,
} from './types';

/**
 * Resources API
 *
 * Manages resources (human, equipment, material, financial) and their allocation to projects.
 *
 * API Specification Reference: Section 6 - Resources
 */
export const resourcesApi = {
    /**
     * Create a new resource
     *
     * @param data Resource creation data
     * @returns Created resource
     *
     * **Endpoint:** POST /resources
     * **Authentication:** Bearer Token (admin, project_manager)
     */
    createResource: (data: ResourceCreate) =>
        apiClient.post<Resource>('/resources', data),

    /**
     * Get list of all resources
     *
     * @param params Query parameters for filtering and pagination
     * @returns List of resources
     *
     * **Endpoint:** GET /resources
     * **Authentication:** Bearer Token
     */
    getResources: (params?: ResourceQueryParams) =>
        apiClient.get<Resource[]>('/resources', params),

    /**
     * Get a specific resource by ID
     *
     * @param resourceId Resource ID
     * @returns Resource details
     *
     * **Endpoint:** GET /resources/{resource_id}
     * **Authentication:** Bearer Token
     */
    getResource: (resourceId: number) =>
        apiClient.get<Resource>(`/resources/${resourceId}`),

    // Note: Backend currently doesn't support resource updates or deletions
    // These methods are commented out until backend support is added

    // updateResource: (resourceId: number, data: ResourceUpdate) =>
    //     apiClient.put<Resource>(`/resources/${resourceId}`, data),

    // deleteResource: (resourceId: number) =>
    //     apiClient.delete<void>(`/resources/${resourceId}`),

    // ==================== Resource Allocation ====================

    /**
     * Allocate a resource to a project
     *
     * @param projectId Project ID
     * @param data Allocation data (includes resource_id)
     * @returns Allocated resource
     *
     * **Endpoint:** POST /resources/projects/{project_id}/resources
     * **Authentication:** Bearer Token (admin, project_manager)
     */
    allocateResource: (projectId: number, data: ResourceAllocationCreate) =>
        apiClient.post<ResourceAllocation>(`/resources/projects/${projectId}/resources`, data),

    /**
     * Get all resources allocated to a specific project
     *
     * @param projectId Project ID
     * @returns List of resource allocations
     *
     * **Endpoint:** GET /resources/projects/{project_id}/resources
     * **Authentication:** Bearer Token
     */
    getProjectResources: (projectId: number) =>
        apiClient.get<ResourceAllocation[]>(`/resources/projects/${projectId}/resources`),
};
