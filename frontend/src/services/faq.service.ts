/**
 * FAQ Service - Domain-specific API abstraction for Frequently Asked Questions
 * Manages FAQ retrieval, categorization, and user feedback
 */

import BaseApiService from './base-api.service';
import { ApiResponse, FAQ, Pagination } from '../types';

interface FAQListResponse {
  faqs: FAQ[];
  pagination: Pagination;
}

interface FAQDetailResponse {
  faq: FAQ;
}

class FAQService extends BaseApiService {
  private readonly endpoint = '/faq';

  /**
   * Get all FAQs with optional filters
   * @param params - Optional filter parameters
   * @param params.category - Filter by FAQ category
   * @param params.tags - Filter by tags array
   * @param params.search - Search query string
   * @param params.page - Page number for pagination
   * @param params.limit - Number of items per page
   * @returns Promise with paginated FAQ list
   * @example
   * ```ts
   * const faqs = await faqService.getFAQs({
   *   category: 'voting',
   *   page: 1,
   *   limit: 20
   * });
   * ```
   */
  async getFAQs(params?: {
    category?: string;
    tags?: string[];
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<FAQListResponse>> {
    return this.get<FAQListResponse>(this.endpoint, {
      params: {
        ...params,
        tags: params?.tags?.join(','),
      },
    });
  }

  /**
   * Get a specific FAQ by ID
   * @param faqId - The unique identifier of the FAQ
   * @returns Promise with complete FAQ data
   * @throws Error if FAQ not found
   */
  async getFAQById(faqId: string): Promise<ApiResponse<FAQDetailResponse>> {
    return this.get<FAQDetailResponse>(`${this.endpoint}/${faqId}`);
  }

  /**
   * Get all available FAQ categories
   * @returns Promise with array of category names
   */
  async getCategories(): Promise<ApiResponse<{ categories: string[] }>> {
    return this.get<{ categories: string[] }>(`${this.endpoint}/categories`);
  }

  /**
   * Vote on whether an FAQ was helpful
   * @param faqId - The unique identifier of the FAQ
   * @param helpful - True if helpful, false if not helpful
   * @returns Promise with success status
   * @description Helps improve FAQ quality through user feedback
   * @example
   * ```ts
   * await faqService.voteHelpful('faq-123', true);
   * ```
   */
  async voteHelpful(faqId: string, helpful: boolean): Promise<ApiResponse<{ success: boolean }>> {
    return this.post<{ success: boolean }>(`${this.endpoint}/${faqId}/helpful`, { helpful });
  }

  /**
   * Get all available FAQ tags
   * @returns Promise with array of tag names
   */
  async getTags(): Promise<ApiResponse<{ tags: string[] }>> {
    return this.get<{ tags: string[] }>(`${this.endpoint}/tags`);
  }

  /**
   * Search FAQs by query string
   * @param query - The search query
   * @param params - Optional filter parameters
   * @param params.category - Filter results by category
   * @param params.page - Page number for pagination
   * @param params.limit - Number of results per page
   * @returns Promise with paginated search results
   */
  async searchFAQs(query: string, params?: {
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<FAQListResponse>> {
    return this.get<FAQListResponse>(`${this.endpoint}/search`, {
      params: {
        q: query,
        ...params,
      },
    });
  }

  /**
   * Get the most popular FAQs based on views and helpfulness votes
   * @param limit - Maximum number of popular FAQs to retrieve (default: 10)
   * @returns Promise with array of popular FAQs
   */
  async getPopularFAQs(limit: number = 10): Promise<ApiResponse<{ faqs: FAQ[] }>> {
    return this.get<{ faqs: FAQ[] }>(`${this.endpoint}/popular`, {
      params: { limit },
    });
  }
}

export const faqService = new FAQService();
export default faqService;
