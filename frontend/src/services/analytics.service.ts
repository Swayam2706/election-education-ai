import { optimizedAPI } from './optimized-api';

export const analyticsService = {
  async trackEvent(eventType: string, eventData: any) {
    try {
      // Fire and forget - don't block UI
      optimizedAPI.post('/analytics/track', { eventType, eventData });
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      console.error('Analytics tracking failed:', error);
    }
  },

  async getRealTimeStats() {
    return optimizedAPI.get('/analytics/stats');
  },

  async getUserRecommendations() {
    return optimizedAPI.get('/analytics/recommendations');
  },
};
