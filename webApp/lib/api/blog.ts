/**
 * Blog API Methods
 *
 * Handles all blog-related endpoints including:
 * - Blog posts CRUD
 * - Categories management
 * - Tags management
 * - Publishing workflow
 */

import { apiClient } from './client';
import type {
  BlogPost,
  BlogPostSummary,
  BlogPostCreate,
  BlogPostUpdate,
  BlogPostListParams,
  BlogPostListResponse,
  BlogCategory,
  BlogCategoryCreate,
  BlogCategoryUpdate,
  BlogCategoryListParams,
  BlogCategoryListResponse,
  BlogTag,
  BlogTagCreate,
  BlogTagUpdate,
  BlogTagListParams,
  BlogTagListResponse,
} from './types';

export const blogApi = {
  // ==================== Blog Posts ====================

  /**
   * Get list of blog posts with optional filtering
   *
   * @param params Query parameters for filtering and pagination
   * @returns Paginated list of blog posts
   */
  getPosts: (params?: BlogPostListParams) =>
    apiClient.get<BlogPostListResponse>('/blog/posts', params),

  /**
   * Get single blog post by ID
   *
   * @param postId Blog post ID
   * @returns Full blog post details
   */
  getPost: (postId: number) =>
    apiClient.get<BlogPost>(`/blog/posts/${postId}`),

  /**
   * Get single blog post by slug
   *
   * @param slug Blog post slug
   * @returns Full blog post details
   */
  getPostBySlug: (slug: string) =>
    apiClient.get<BlogPost>(`/blog/posts/by-slug/${slug}`),

  /**
   * Create a new blog post (Admin only)
   *
   * @param data Blog post creation data
   * @returns Created blog post
   */
  createPost: (data: BlogPostCreate) =>
    apiClient.post<BlogPost>('/blog/posts', data),

  /**
   * Update existing blog post (Admin only)
   *
   * @param postId Blog post ID
   * @param data Blog post update data
   * @returns Updated blog post
   */
  updatePost: (postId: number, data: BlogPostUpdate) =>
    apiClient.put<BlogPost>(`/blog/posts/${postId}`, data),

  /**
   * Delete blog post (Admin only)
   *
   * @param postId Blog post ID
   * @returns void
   */
  deletePost: (postId: number) =>
    apiClient.delete<void>(`/blog/posts/${postId}`),

  /**
   * Publish blog post (Admin only)
   *
   * @param postId Blog post ID
   * @returns Published blog post
   */
  publishPost: (postId: number) =>
    apiClient.post<BlogPost>(`/blog/posts/${postId}/publish`),

  /**
   * Unpublish blog post (revert to draft) (Admin only)
   *
   * @param postId Blog post ID
   * @returns Unpublished blog post
   */
  unpublishPost: (postId: number) =>
    apiClient.post<BlogPost>(`/blog/posts/${postId}/unpublish`),

  // ==================== Categories ====================

  /**
   * Get list of categories
   *
   * @param params Query parameters for pagination
   * @returns Paginated list of categories
   */
  getCategories: (params?: BlogCategoryListParams) =>
    apiClient.get<BlogCategoryListResponse>('/blog/categories', params),

  /**
   * Get single category by ID
   *
   * @param categoryId Category ID
   * @returns Category details
   */
  getCategory: (categoryId: number) =>
    apiClient.get<BlogCategory>(`/blog/categories/${categoryId}`),

  /**
   * Get single category by slug
   *
   * @param slug Category slug
   * @returns Category details
   */
  getCategoryBySlug: (slug: string) =>
    apiClient.get<BlogCategory>(`/blog/categories/by-slug/${slug}`),

  /**
   * Create a new category (Admin only)
   *
   * @param data Category creation data
   * @returns Created category
   */
  createCategory: (data: BlogCategoryCreate) =>
    apiClient.post<BlogCategory>('/blog/categories', data),

  /**
   * Update existing category (Admin only)
   *
   * @param categoryId Category ID
   * @param data Category update data
   * @returns Updated category
   */
  updateCategory: (categoryId: number, data: BlogCategoryUpdate) =>
    apiClient.put<BlogCategory>(`/blog/categories/${categoryId}`, data),

  /**
   * Delete category (Admin only)
   *
   * @param categoryId Category ID
   * @returns void
   */
  deleteCategory: (categoryId: number) =>
    apiClient.delete<void>(`/blog/categories/${categoryId}`),

  // ==================== Tags ====================

  /**
   * Get list of tags
   *
   * @param params Query parameters for pagination
   * @returns Paginated list of tags
   */
  getTags: (params?: BlogTagListParams) =>
    apiClient.get<BlogTagListResponse>('/blog/tags', params),

  /**
   * Get single tag by ID
   *
   * @param tagId Tag ID
   * @returns Tag details
   */
  getTag: (tagId: number) =>
    apiClient.get<BlogTag>(`/blog/tags/${tagId}`),

  /**
   * Get single tag by slug
   *
   * @param slug Tag slug
   * @returns Tag details
   */
  getTagBySlug: (slug: string) =>
    apiClient.get<BlogTag>(`/blog/tags/by-slug/${slug}`),

  /**
   * Create a new tag (Admin only)
   *
   * @param data Tag creation data
   * @returns Created tag
   */
  createTag: (data: BlogTagCreate) =>
    apiClient.post<BlogTag>('/blog/tags', data),

  /**
   * Update existing tag (Admin only)
   *
   * @param tagId Tag ID
   * @param data Tag update data
   * @returns Updated tag
   */
  updateTag: (tagId: number, data: BlogTagUpdate) =>
    apiClient.put<BlogTag>(`/blog/tags/${tagId}`, data),

  /**
   * Delete tag (Admin only)
   *
   * @param tagId Tag ID
   * @returns void
   */
  deleteTag: (tagId: number) =>
    apiClient.delete<void>(`/blog/tags/${tagId}`),
};
