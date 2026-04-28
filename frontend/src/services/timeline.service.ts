/**
 * Timeline Service - Domain-specific API abstraction for historical election events
 * Manages timeline events, filtering, and chronological data retrieval
 */

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
   * @param params - Optional filter parameters
   * @param params.category - Filter by event category
   * @param params.country - Filter by country
   * @param params.startDate - Filter events after this date (ISO format)
   * @param params.endDate - Filter events before this date (ISO format)
   * @param params.importance - Filter by importance level
   * @param params.page - Page number for pagination
   * @param params.limit - Number of items per page
   * @returns Promise with paginated timeline events
   * @example
   * ```ts
   * const events = await timelineService.getEvents({
   *   country: 'USA',
   *   startDate: '2020-01-01',
   *   importance: 'high'
   * });
   * ```
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
   * @param eventId - The unique identifier of the timeline event
   * @returns Promise with complete event data
   * @throws Error if event not found
   */
  async getEventById(eventId: string): Promise<ApiResponse<TimelineDetailResponse>> {
    return this.get<TimelineDetailResponse>(`${this.endpoint}/${eventId}`);
  }

  /**
   * Get all available timeline event categories
   * @returns Promise with array of category names
   */
  async getCategories(): Promise<ApiResponse<{ categories: string[] }>> {
    return this.get<{ categories: string[] }>(`${this.endpoint}/categories`);
  }

  /**
   * Get all countries that have timeline events
   * @returns Promise with array of country names
   */
  async getCountries(): Promise<ApiResponse<{ countries: string[] }>> {
    return this.get<{ countries: string[] }>(`${this.endpoint}/countries`);
  }

  /**
   * Get all events that occurred in a specific year
   * @param year - The year to filter events (e.g., 2020)
   * @returns Promise with array of events from that year
   * @example
   * ```ts
   * const events2020 = await timelineService.getEventsByYear(2020);
   * ```
   */
  async getEventsByYear(year: number): Promise<ApiResponse<{ events: TimelineEvent[] }>> {
    return this.get<{ events: TimelineEvent[] }>(`${this.endpoint}/year/${year}`);
  }

  /**
   * Get events within a specific date range
   * @param startDate - Start date in ISO format (YYYY-MM-DD)
   * @param endDate - End date in ISO format (YYYY-MM-DD)
   * @returns Promise with array of events in the date range
   * @example
   * ```ts
   * const events = await timelineService.getEventsByDateRange(
   *   '2020-01-01',
   *   '2020-12-31'
   * );
   * ```
   */
  async getEventsByDateRange(startDate: string, endDate: string): Promise<ApiResponse<{ events: TimelineEvent[] }>> {
    return this.get<{ events: TimelineEvent[] }>(`${this.endpoint}/range`, {
      params: { startDate, endDate },
    });
  }
}

export const timelineService = new TimelineService();
export default timelineService;
