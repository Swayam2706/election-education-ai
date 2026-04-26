import { optimizedAPI } from './optimized-api';

export const siteService = {
  async getNavigationLinks(language = 'en') {
    return optimizedAPI.get(`/site/navigation?language=${language}`);
  },

  async getFooterSections(language = 'en') {
    return optimizedAPI.get(`/site/footer?language=${language}`);
  },

  async getStatCards(language = 'en') {
    return optimizedAPI.get(`/site/stats?language=${language}`);
  },

  async getFeatureCards(language = 'en') {
    return optimizedAPI.get(`/site/features?language=${language}`);
  },

  async getChatSuggestions(language = 'en', category?: string) {
    const params = new URLSearchParams({ language });
    if (category) params.append('category', category);
    return optimizedAPI.get(`/site/chat-suggestions?${params}`);
  },

  async getPageContent(slug: string, language = 'en') {
    return optimizedAPI.get(`/site/page/${slug}?language=${language}`);
  },

  async getSiteSettings(key?: string) {
    const params = key ? `?key=${key}` : '';
    return optimizedAPI.get(`/site/settings${params}`);
  },
};
