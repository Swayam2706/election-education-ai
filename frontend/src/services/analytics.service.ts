import { logger } from '../utils/logger';
import { apiService } from './api.service';

interface AnalyticsEvent {
  eventType: string;
  eventData: Record<string, unknown>;
}

interface AnalyticsStats {
  activeUsers: number;
  totalEvents: number;
  [key: string]: unknown;
}

interface UserRecommendation {
  id: string;
  title: string;
  description: string;
  [key: string]: unknown;
}

export const analyticsService = {
  async trackEvent(eventType: string, eventData: Record<string, unknown>): Promise<void> {
    try {
      // Fire and forget - don't block UI
      await apiService.post<void>('/analytics/track', { eventType, eventData });
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      logger.debug('Analytics tracking failed:', error);
    }
  },

  async getRealTimeStats(): Promise<AnalyticsStats> {
    const response = await apiService.get<AnalyticsStats>('/analytics/stats');
    return response.data;
  },

  async getUserRecommendations(): Promise<UserRecommendation[]> {
    const response = await apiService.get<UserRecommendation[]>('/analytics/recommendations');
    return response.data;
  },
};
