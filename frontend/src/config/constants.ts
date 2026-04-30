// Application constants

export const APP_CONFIG = {
  name: 'Election Education Platform',
  version: '2.0.0',
  description: 'Learn about elections, voting, and democratic processes',
} as const;

export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  timeout: 30000,
  retries: 3,
} as const;

export const CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
} as const;

export const AUTH_CONFIG = {
  tokenKey: 'auth_token',
  refreshInterval: 6 * 60 * 60 * 1000, // 6 hours
  sessionTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CHAT: '/chat',
  QUIZ: '/quiz',
  LEARN: '/learn',
  TIMELINE: '/timeline',
  FAQ: '/faq',
  ELIGIBILITY: '/eligibility',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
} as const;

export const QUIZ_CATEGORIES = [
  'voting-process',
  'election-system',
  'candidates',
  'civic-duty',
  'history',
] as const;

export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export const USER_ROLES = ['USER', 'ADMIN'] as const;

export const THEMES = ['light', 'dark', 'system'] as const;

export const LANGUAGES = ['en', 'es', 'fr', 'de', 'hi'] as const;

export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email address',
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must contain uppercase, lowercase, number, and special character',
  },
  name: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
    message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  },
} as const;

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  transition: 200,
  hover: 400,
} as const;

export const TIMING = {
  // Debounce delays
  DEBOUNCE_SEARCH: 300,
  DEBOUNCE_INPUT: 500,
  
  // Retry delays
  RETRY_BASE_DELAY: 1000,
  RETRY_MAX_DELAY: 30000,
  
  // Timeout values
  API_TIMEOUT: 30000,
  HEALTH_CHECK_TIMEOUT: 5000,
  
  // Intervals
  TOKEN_REFRESH_INTERVAL: 6 * 60 * 60 * 1000, // 6 hours
  TOKEN_EXPIRY_BUFFER: 6 * 24 * 60 * 60 * 1000, // 6 days
  
  // UI delays
  TOAST_DURATION: 3000,
  ANNOUNCEMENT_DURATION: 1000,
  QUIZ_TIMER_INTERVAL: 1000,
  
  // Time conversions
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
} as const;

export const SCORE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 70,
  AVERAGE: 50,
  POOR: 0,
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Session expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN: 'Welcome back!',
  REGISTER: 'Account created successfully!',
  LOGOUT: 'Logged out successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  MESSAGE_SENT: 'Message sent successfully',
} as const;
