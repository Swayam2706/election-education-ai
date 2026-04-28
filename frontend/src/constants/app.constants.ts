/**
 * Application-wide constants
 * Centralized configuration values used throughout the application
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

/**
 * Cache Configuration
 */
export const CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5 minutes
  MAX_SIZE: 100,
} as const;

/**
 * Pagination Configuration
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

/**
 * Quiz Configuration
 */
export const QUIZ_CONFIG = {
  MIN_PASS_PERCENTAGE: 60,
  DEFAULT_TIME_LIMIT: 30, // minutes
  QUESTIONS_PER_PAGE: 1,
} as const;

/**
 * Animation Configuration
 */
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 0.2,
    NORMAL: 0.3,
    SLOW: 0.5,
  },
  EASING: 'easeInOut',
} as const;

/**
 * Accessibility Configuration
 */
export const A11Y_CONFIG = {
  MIN_TOUCH_TARGET: 44, // pixels
  FOCUS_VISIBLE_OUTLINE: '2px solid #3b82f6',
  SKIP_LINK_ID: 'main-content',
} as const;

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  USER_PREFERENCES: 'userPreferences',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

/**
 * Route Paths
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  QUIZ: '/quiz',
  QUIZ_DETAIL: '/quiz/:id',
  LEARN: '/learn',
  LEARN_ARTICLE: '/learn/:slug',
  CHAT: '/chat',
  ELIGIBILITY: '/eligibility',
  TIMELINE: '/timeline',
  FAQ: '/faq',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  REGISTER: 'Account created successfully!',
  LOGOUT: 'Successfully logged out.',
  QUIZ_SUBMITTED: 'Quiz submitted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
} as const;
