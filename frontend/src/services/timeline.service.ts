import { apiService } from './api.service';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string | null;
  phase: string;
  order: number;
  icon: string | null;
  language: string;
}

export const timelineService = {
  async getTimeline(params?: { 
    language?: string; 
    category?: string; 
    year?: number;
    status?: string;
  }) {
    const response = await apiService.get('/timeline', { params });
    return response;
  },

  async getTimelineEvent(id: string) {
    const response = await apiService.get(`/timeline/${id}`);
    return response;
  },

  async getTimelineCategories() {
    const response = await apiService.get('/timeline/categories');
    return response;
  },

  async getTimelineYears() {
    const response = await apiService.get('/timeline/years');
    return response;
  }
};
