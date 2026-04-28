// FAQ Service - Domain-specific API abstraction
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
   */
  async getFAQById(faqId: string): Promise<ApiResponse<FAQDetailResponse>> {
    return this.get<FAQDetailResponse>(`${this.endpoint}/${faqId}`);
  }

  /**
   * Get FAQ categories
   */
  async getCategories(): Promise<ApiResponse<{ categories: string[] }>> {
    return this.get<{ categories: string[] }>(`${this.endpoint}/categories`);
  }

  /**
   * Vote on FAQ helpfulness
   */
  async voteHelpful(faqId: string, helpful: boolean): Promise<ApiResponse<{ success: boolean }>> {
    return this.post<{ success: boolean }>(`${this.endpoint}/${faqId}/helpful`, { helpful });
  }

  /**
   * Get FAQ tags
   */
  async getTags(): Promise<ApiResponse<{ tags: string[] }>> {
    return this.get<{ tags: string[] }>(`${this.endpoint}/tags`);
  }

  /**
   * Search FAQs
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
   * Get popular FAQs
   */
  async getPopularFAQs(limit: number = 10): Promise<ApiResponse<{ faqs: FAQ[] }>> {
    return this.get<{ faqs: FAQ[] }>(`${this.endpoint}/popular`, {
      params: { limit },
    });
  }
}

export const faqService = new FAQService();
export default faqService;
