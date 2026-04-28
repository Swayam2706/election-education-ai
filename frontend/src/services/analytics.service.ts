import { optimizedAPI } from './optimized-api';
import { logger } from '../utils/logger';

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
      optimizedAPI.post<void>('/analytics/track', { eventType, eventData });
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      logger.debug('Analytics tracking failed:', error);
    }
  },

  async getRealTimeStats(): Promise<AnalyticsStats> {
    return optimizedAPI.get<AnalyticsStats>('/analytics/stats');
  },

  async getUserRecommendations(): Promise<UserRecommendation[]> {
    return optimizedAPI.get<UserRecommendation[]>('/analytics/recommendations');
  },
};
