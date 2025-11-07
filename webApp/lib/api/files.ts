/**
 * Files API Methods
 *
 * Handles all file-related endpoints including:
 * - File upload
 * - File management
 * - File attachments
 */

import { apiClient } from './client';
import type {
  FileUpload,
  FileQueryParams,
} from './types';

export const filesApi = {
  // ==================== Files CRUD ====================

  /**
   * Upload a file
   *
   * @param formData Form data containing file and metadata
   * @returns Uploaded file information
   */
  uploadFile: async (formData: FormData): Promise<FileUpload> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${baseUrl}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
  },

  /**
   * Get list of files with optional filtering
   *
   * @param params Query parameters for filtering
   * @returns Array of files
   */
  getFiles: (params?: FileQueryParams) =>
    apiClient.get<FileUpload[]>('/files', params),

  /**
   * Get a specific file by ID
   *
   * @param id File ID
   * @returns File details
   */
  getFile: (id: number) =>
    apiClient.get<FileUpload>(`/files/${id}`),

  /**
   * Delete a file
   *
   * @param id File ID
   * @returns Success message
   */
  deleteFile: (id: number) =>
    apiClient.delete<{ message: string }>(`/files/${id}`),

  /**
   * Get file download URL
   *
   * @param id File ID
   * @returns Download URL
   */
  getFileUrl: (filePath: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return `${baseUrl}${filePath}`;
  },
};
