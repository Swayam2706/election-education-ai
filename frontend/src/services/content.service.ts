import { apiService } from './api.service';

export interface EducationalContent {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  language: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const contentService = {
  async getContents(params?: {
    category?: string;
    language?: string;
    search?: string;
  }) {
    const response = await apiService.get('/content', { params });
    return response;
  },

  async getContentBySlug(slug: string) {
    const response = await apiService.get(`/content/${slug}`);
    return response;
  },

  async getContent(id: string) {
    const response = await apiService.get(`/content/${id}`);
    return response;
  },

  async getContentCategories() {
    const response = await apiService.get('/content/categories');
    return response;
  },

  async likeContent(id: string) {
    const response = await apiService.post(`/content/${id}/like`);
    return response;
  },

  async trackContentView(id: string) {
    const response = await apiService.post(`/content/${id}/view`);
    return response;
  }
};
