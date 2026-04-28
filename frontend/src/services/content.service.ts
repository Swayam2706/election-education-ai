/**
 * Content Service - Domain-specific API abstraction for educational content
 * Manages articles, learning materials, and content discovery
 */

import BaseApiService from './base-api.service';
import { ApiResponse, Content, Pagination } from '../types';

interface ContentListResponse {
  contents: Content[];
  pagination: Pagination;
}

interface ContentDetailResponse {
  content: Content;
}

class ContentService extends BaseApiService {
  private readonly endpoint = '/content';

  /**
   * Get all content articles with optional filters
   * @param params - Optional filter parameters
   * @param params.category - Filter by content category
   * @param params.difficulty - Filter by difficulty level
   * @param params.tags - Filter by tags array
   * @param params.search - Search query string
   * @param params.page - Page number for pagination
   * @param params.limit - Number of items per page
   * @returns Promise with paginated content list
   * @example
   * ```ts
   * const contents = await contentService.getContents({
   *   category: 'voting',
   *   difficulty: 'beginner',
   *   page: 1,
   *   limit: 10
   * });
   * ```
   */
  async getContents(params?: {
    category?: string;
    difficulty?: string;
    tags?: string[];
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<ContentListResponse>> {
    return this.get<ContentListResponse>(this.endpoint, {
      params: {
        ...params,
        tags: params?.tags?.join(','),
      },
    });
  }

  /**
   * Get a specific content article by ID
   * @param contentId - The unique identifier of the content
   * @returns Promise with complete content data
   * @throws Error if content not found
   */
  async getContentById(contentId: string): Promise<ApiResponse<ContentDetailResponse>> {
    return this.get<ContentDetailResponse>(`${this.endpoint}/${contentId}`);
  }

  /**
   * Get content by URL-friendly slug
   * @param slug - The URL slug of the content
   * @returns Promise with complete content data
   * @throws Error if content not found
   * @example
   * ```ts
   * const content = await contentService.getContentBySlug('understanding-democracy');
   * ```
   */
  async getContentBySlug(slug: string): Promise<ApiResponse<ContentDetailResponse>> {
    return this.get<ContentDetailResponse>(`${this.endpoint}/slug/${slug}`);
  }

  /**
   * Get featured content articles
   * @param limit - Maximum number of featured items to retrieve (default: 5)
   * @returns Promise with array of featured content
   */
  async getFeaturedContent(limit: number = 5): Promise<ApiResponse<{ contents: Content[] }>> {
    return this.get<{ contents: Content[] }>(`${this.endpoint}/featured`, {
      params: { limit },
    });
  }

  /**
   * Get related content based on a specific article
   * @param contentId - The ID of the content to find related articles for
   * @param limit - Maximum number of related items (default: 5)
   * @returns Promise with array of related content
   */
  async getRelatedContent(contentId: string, limit: number = 5): Promise<ApiResponse<{ contents: Content[] }>> {
    return this.get<{ contents: Content[] }>(`${this.endpoint}/${contentId}/related`, {
      params: { limit },
    });
  }

  /**
   * Track that a user has read a content article
   * @param contentId - The ID of the content that was read
   * @returns Promise that resolves when tracking is complete
   * @description Updates user statistics and content analytics
   */
  async trackRead(contentId: string): Promise<ApiResponse<void>> {
    return this.post<void>(`${this.endpoint}/${contentId}/read`);
  }

  /**
   * Get all available content categories
   * @returns Promise with array of category names
   */
  async getCategories(): Promise<ApiResponse<{ categories: string[] }>> {
    return this.get<{ categories: string[] }>(`${this.endpoint}/categories`);
  }

  /**
   * Get all available content tags
   * @returns Promise with array of tag names
   */
  async getTags(): Promise<ApiResponse<{ tags: string[] }>> {
    return this.get<{ tags: string[] }>(`${this.endpoint}/tags`);
  }

  /**
   * Search content articles by query string
   * @param query - The search query
   * @param params - Optional filter parameters
   * @param params.category - Filter results by category
   * @param params.page - Page number for pagination
   * @param params.limit - Number of results per page
   * @returns Promise with paginated search results
   * @example
   * ```ts
   * const results = await contentService.searchContent('voting rights', {
   *   category: 'elections',
   *   limit: 20
   * });
   * ```
   */
  async searchContent(query: string, params?: {
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<ContentListResponse>> {
    return this.get<ContentListResponse>(`${this.endpoint}/search`, {
      params: {
        q: query,
        ...params,
      },
    });
  }
}

export const contentService = new ContentService();
export default contentService;
