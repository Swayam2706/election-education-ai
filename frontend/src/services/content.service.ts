// Content Service - Domain-specific API abstraction
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
   */
  async getContentById(contentId: string): Promise<ApiResponse<ContentDetailResponse>> {
    return this.get<ContentDetailResponse>(`${this.endpoint}/${contentId}`);
  }

  /**
   * Get content by slug
   */
  async getContentBySlug(slug: string): Promise<ApiResponse<ContentDetailResponse>> {
    return this.get<ContentDetailResponse>(`${this.endpoint}/slug/${slug}`);
  }

  /**
   * Get featured content
   */
  async getFeaturedContent(limit: number = 5): Promise<ApiResponse<{ contents: Content[] }>> {
    return this.get<{ contents: Content[] }>(`${this.endpoint}/featured`, {
      params: { limit },
    });
  }

  /**
   * Get related content
   */
  async getRelatedContent(contentId: string, limit: number = 5): Promise<ApiResponse<{ contents: Content[] }>> {
    return this.get<{ contents: Content[] }>(`${this.endpoint}/${contentId}/related`, {
      params: { limit },
    });
  }

  /**
   * Track content read
   */
  async trackRead(contentId: string): Promise<ApiResponse<void>> {
    return this.post<void>(`${this.endpoint}/${contentId}/read`);
  }

  /**
   * Get content categories
   */
  async getCategories(): Promise<ApiResponse<{ categories: string[] }>> {
    return this.get<{ categories: string[] }>(`${this.endpoint}/categories`);
  }

  /**
   * Get content tags
   */
  async getTags(): Promise<ApiResponse<{ tags: string[] }>> {
    return this.get<{ tags: string[] }>(`${this.endpoint}/tags`);
  }

  /**
   * Search content
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
