// Timeline Service - Domain-specific API abstraction
import BaseApiService from './base-api.service';
import { ApiResponse, TimelineEvent, Pagination } from '../types';

interface TimelineListResponse {
  events: TimelineEvent[];
  pagination: Pagination;
}

interface TimelineDetailResponse {
  event: TimelineEvent;
}

class TimelineService extends BaseApiService {
  private readonly endpoint = '/timeline';

  /**
   * Get all timeline events with optional filters
   */
  async getEvents(params?: {
    category?: string;
    country?: string;
    startDate?: string;
    endDate?: string;
    importance?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<TimelineListResponse>> {
    return this.get<TimelineListResponse>(this.endpoint, {
      params,
    });
  }

  /**
   * Get a specific timeline event by ID
   */
  async getEventById(eventId: string): Promise<ApiResponse<TimelineDetailResponse>> {
    return this.get<TimelineDetailResponse>(`${this.endpoint}/${eventId}`);
  }

  /**
   * Get timeline categories
   */
  async getCategories(): Promise<ApiResponse<{ categories: string[] }>> {
    return this.get<{ categories: string[] }>(`${this.endpoint}/categories`);
  }

  /**
   * Get timeline countries
   */
  async getCountries(): Promise<ApiResponse<{ countries: string[] }>> {
    return this.get<{ countries: string[] }>(`${this.endpoint}/countries`);
  }

  /**
   * Get events by year
   */
  async getEventsByYear(year: number): Promise<ApiResponse<{ events: TimelineEvent[] }>> {
    return this.get<{ events: TimelineEvent[] }>(`${this.endpoint}/year/${year}`);
  }

  /**
   * Get events by date range
   */
  async getEventsByDateRange(startDate: string, endDate: string): Promise<ApiResponse<{ events: TimelineEvent[] }>> {
    return this.get<{ events: TimelineEvent[] }>(`${this.endpoint}/range`, {
      params: { startDate, endDate },
    });
  }
}

export const timelineService = new TimelineService();
export default timelineService;
