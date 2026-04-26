import { apiService } from './api.service';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  language: string;
  order: number;
}

export const faqService = {
  async getFAQs(params?: { category?: string; language?: string }) {
    const response = await apiService.get('/faq', { params });
    return response;
  },

  async getFAQ(id: string) {
    const response = await apiService.get(`/faq/${id}`);
    return response;
  },

  async voteFAQ(id: string, helpful: boolean) {
    const response = await apiService.post(`/faq/${id}/helpful`, { helpful });
    return response;
  },

  async searchFAQs(query: string) {
    const response = await apiService.get('/faq/search', { params: { q: query } });
    return response;
  }
};
