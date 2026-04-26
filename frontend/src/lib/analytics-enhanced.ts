import { logEvent, setUserProperties, setUserId } from 'firebase/analytics';
import { analytics } from './firebase';

// Enhanced analytics tracking
export const analyticsService = {
  // Page views
  trackPageView: (pageName: string, pageTitle?: string) => {
    if (!analytics) return;
    logEvent(analytics, 'page_view', {
      page_name: pageName,
      page_title: pageTitle || pageName,
      page_location: window.location.href,
      page_path: window.location.pathname,
    });
  },

  // User actions
  trackButtonClick: (buttonName: string, location: string) => {
    if (!analytics) return;
    logEvent(analytics, 'button_click', {
      button_name: buttonName,
      location,
    });
  },

  trackFormSubmit: (formName: string, success: boolean) => {
    if (!analytics) return;
    logEvent(analytics, 'form_submit', {
      form_name: formName,
      success,
    });
  },

  // Quiz tracking
  trackQuizStart: (quizId: string, quizTitle: string) => {
    if (!analytics) return;
    logEvent(analytics, 'quiz_start', {
      quiz_id: quizId,
      quiz_title: quizTitle,
    });
  },

  trackQuizComplete: (quizId: string, score: number, percentage: number, timeSpent: number) => {
    if (!analytics) return;
    logEvent(analytics, 'quiz_complete', {
      quiz_id: quizId,
      score,
      percentage,
      time_spent: timeSpent,
    });
  },

  // Content tracking
  trackArticleView: (articleId: string, articleTitle: string) => {
    if (!analytics) return;
    logEvent(analytics, 'article_view', {
      article_id: articleId,
      article_title: articleTitle,
    });
  },

  trackArticleRead: (articleId: string, readTime: number) => {
    if (!analytics) return;
    logEvent(analytics, 'article_read', {
      article_id: articleId,
      read_time: readTime,
    });
  },

  // Chat tracking
  trackChatMessage: (messageLength: number) => {
    if (!analytics) return;
    logEvent(analytics, 'chat_message_sent', {
      message_length: messageLength,
    });
  },

  trackChatResponse: (responseTime: number) => {
    if (!analytics) return;
    logEvent(analytics, 'chat_response_received', {
      response_time: responseTime,
    });
  },

  // Search tracking
  trackSearch: (searchTerm: string, resultsCount: number) => {
    if (!analytics) return;
    logEvent(analytics, 'search', {
      search_term: searchTerm,
      results_count: resultsCount,
    });
  },

  // Error tracking
  trackError: (errorType: string, errorMessage: string, location: string) => {
    if (!analytics) return;
    logEvent(analytics, 'error', {
      error_type: errorType,
      error_message: errorMessage,
      location,
    });
  },

  // User properties
  setUserProperty: (propertyName: string, value: string) => {
    if (!analytics) return;
    setUserProperties(analytics, { [propertyName]: value });
  },

  setUser: (userId: string) => {
    if (!analytics) return;
    setUserId(analytics, userId);
  },

  // Engagement tracking
  trackEngagement: (engagementType: string, duration: number) => {
    if (!analytics) return;
    logEvent(analytics, 'user_engagement', {
      engagement_type: engagementType,
      duration,
    });
  },

  // Conversion tracking
  trackConversion: (conversionType: string, value?: number) => {
    if (!analytics) return;
    logEvent(analytics, 'conversion', {
      conversion_type: conversionType,
      value: value || 0,
    });
  },
};

export default analyticsService;
