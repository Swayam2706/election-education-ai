// Enterprise React Query Configuration

import { QueryClient, DefaultOptions, MutationCache, QueryCache } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';

// Default query options
const defaultQueryOptions: DefaultOptions = {
  queries: {
    // Stale time: 5 minutes
    staleTime: 5 * 60 * 1000,
    
    // Cache time: 10 minutes
    gcTime: 10 * 60 * 1000,
    
    // Retry configuration
    retry: (failureCount, error: unknown) => {
      // Don't retry on 4xx errors (client errors)
      const apiError = error as { response?: { status?: number } };
      if (apiError?.response?.status && apiError.response.status >= 400 && apiError.response.status < 500) {
        return false;
      }
      
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Refetch on window focus (only in production)
    refetchOnWindowFocus: process.env.NODE_ENV === 'production',
    
    // Refetch on reconnect
    refetchOnReconnect: true,
    
    // Network mode
    networkMode: 'online',
  },
  
  mutations: {
    // Retry mutations once
    retry: 1,
    
    // Network mode
    networkMode: 'online',
  },
};

// Query cache configuration
const queryCache = new QueryCache({
  onError: (error: unknown, query) => {
    const apiError = error as { message?: string; response?: { status?: number; data?: { error?: { message?: string } } } };
    
    // Log query errors
    if (typeof window !== 'undefined') {
      import('../utils/logger').then(({ logger }) => {
        logger.error('Query error', {
          queryKey: query.queryKey,
          error: apiError.message,
          status: apiError?.response?.status,
        });
      });
    }

    // Don't show toast for background refetches
    if (query.state.data !== undefined) {
      return;
    }

    // Show error toast for failed queries
    const errorMessage = apiError?.response?.data?.error?.message || apiError.message || 'Something went wrong';
    toast.error(errorMessage);
  },
  
  onSuccess: (data, query) => {
    // Log successful queries in development
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      import('../utils/logger').then(({ logger }) => {
        logger.debug('Query success', {
          queryKey: query.queryKey,
          data,
        });
      });
    }
  },
});

// Mutation cache configuration
const mutationCache = new MutationCache({
  onError: (error: unknown, variables, context, mutation) => {
    const apiError = error as { message?: string; response?: { status?: number; data?: { error?: { message?: string } } } };
    
    // Log mutation errors
    if (typeof window !== 'undefined') {
      import('../utils/logger').then(({ logger }) => {
        logger.error('Mutation error', {
          mutationKey: mutation.options.mutationKey,
          error: apiError.message,
          status: apiError?.response?.status,
          variables,
        });
      });
    }

    // Show error toast (unless explicitly disabled)
    if (!mutation.options.meta?.skipErrorToast) {
      const errorMessage = apiError?.response?.data?.error?.message || apiError.message || 'Operation failed';
      toast.error(errorMessage);
    }
  },
  
  onSuccess: (data, variables, context, mutation) => {
    // Log successful mutations in development
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      import('../utils/logger').then(({ logger }) => {
        logger.debug('Mutation success', {
          mutationKey: mutation.options.mutationKey,
          data,
          variables,
        });
      });
    }

    // Show success toast (if specified)
    if (mutation.options.meta?.successMessage) {
      toast.success(mutation.options.meta.successMessage as string);
    }
  },
});

// Create query client
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
  queryCache,
  mutationCache,
});

// Query key factory for consistent key generation
export const queryKeys = {
  // Auth
  auth: {
    me: () => ['auth', 'me'] as const,
    profile: () => ['auth', 'profile'] as const,
  },
  
  // Users
  users: {
    all: () => ['users'] as const,
    list: (filters?: Record<string, unknown>) => ['users', 'list', filters] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    stats: (id: string) => ['users', 'stats', id] as const,
  },
  
  // Content
  content: {
    all: () => ['content'] as const,
    list: (type?: string, filters?: Record<string, unknown>) => ['content', 'list', type, filters] as const,
    detail: (id: string) => ['content', 'detail', id] as const,
    search: (query: string, filters?: Record<string, unknown>) => ['content', 'search', query, filters] as const,
  },
  
  // Quizzes
  quizzes: {
    all: () => ['quizzes'] as const,
    list: (filters?: Record<string, unknown>) => ['quizzes', 'list', filters] as const,
    detail: (id: string) => ['quizzes', 'detail', id] as const,
    attempts: (userId: string) => ['quizzes', 'attempts', userId] as const,
    attempt: (id: string) => ['quizzes', 'attempt', id] as const,
  },
  
  // Timeline
  timeline: {
    all: () => ['timeline'] as const,
    events: (filters?: Record<string, unknown>) => ['timeline', 'events', filters] as const,
    event: (id: string) => ['timeline', 'event', id] as const,
  },
  
  // FAQ
  faq: {
    all: () => ['faq'] as const,
    list: (filters?: Record<string, unknown>) => ['faq', 'list', filters] as const,
    detail: (id: string) => ['faq', 'detail', id] as const,
    categories: () => ['faq', 'categories'] as const,
  },
  
  // Chat
  chat: {
    all: () => ['chat'] as const,
    history: (userId: string) => ['chat', 'history', userId] as const,
    conversation: (id: string) => ['chat', 'conversation', id] as const,
  },
  
  // Analytics
  analytics: {
    all: () => ['analytics'] as const,
    dashboard: () => ['analytics', 'dashboard'] as const,
    users: (period?: string) => ['analytics', 'users', period] as const,
    content: (period?: string) => ['analytics', 'content', period] as const,
    engagement: (period?: string) => ['analytics', 'engagement', period] as const,
  },
  
  // Site
  site: {
    all: () => ['site'] as const,
    settings: () => ['site', 'settings'] as const,
    navigation: () => ['site', 'navigation'] as const,
    features: () => ['site', 'features'] as const,
  },
  
  // Admin
  admin: {
    all: () => ['admin'] as const,
    users: (filters?: Record<string, unknown>) => ['admin', 'users', filters] as const,
    content: (filters?: Record<string, unknown>) => ['admin', 'content', filters] as const,
    analytics: () => ['admin', 'analytics'] as const,
    logs: (filters?: Record<string, unknown>) => ['admin', 'logs', filters] as const,
  },
};

// Utility functions for cache management
export const cacheUtils = {
  // Invalidate all queries for a specific key pattern
  invalidateQueries: (queryKey: readonly unknown[]) => {
    return queryClient.invalidateQueries({ queryKey });
  },
  
  // Remove specific query from cache
  removeQueries: (queryKey: readonly unknown[]) => {
    return queryClient.removeQueries({ queryKey });
  },
  
  // Set query data manually
  setQueryData: <T>(queryKey: readonly unknown[], data: T) => {
    return queryClient.setQueryData(queryKey, data);
  },
  
  // Get query data from cache
  getQueryData: <T>(queryKey: readonly unknown[]): T | undefined => {
    return queryClient.getQueryData(queryKey);
  },
  
  // Prefetch query
  prefetchQuery: (queryKey: readonly unknown[], queryFn: () => Promise<unknown>) => {
    return queryClient.prefetchQuery({
      queryKey,
      queryFn,
    });
  },
  
  // Clear all cache
  clear: () => {
    return queryClient.clear();
  },
  
  // Invalidate all auth-related queries
  invalidateAuth: () => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
  },
  
  // Invalidate user-specific data
  invalidateUserData: (userId: string) => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats(userId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.attempts(userId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.history(userId) }),
    ]);
  },
  
  // Update user stats optimistically
  updateUserStats: (userId: string, stats: Record<string, unknown>) => {
    const userKey = queryKeys.users.detail(userId);
    const currentData = queryClient.getQueryData(userKey) as { data?: { user?: { stats?: Record<string, unknown> } } } | undefined;
    
    if (currentData?.data?.user) {
      queryClient.setQueryData(userKey, {
        ...currentData,
        data: {
          ...currentData.data,
          user: {
            ...currentData.data.user,
            stats: {
              ...currentData.data.user.stats,
              ...stats,
            },
          },
        },
      });
    }
    
    // Also update auth user data
    const authKey = queryKeys.auth.me();
    const authData = queryClient.getQueryData(authKey) as { data?: { user?: { stats?: Record<string, unknown> } } } | undefined;
    
    if (authData?.data?.user) {
      queryClient.setQueryData(authKey, {
        ...authData,
        data: {
          ...authData.data,
          user: {
            ...authData.data.user,
            stats: {
              ...authData.data.user.stats,
              ...stats,
            },
          },
        },
      });
      
      // Update store as well
      const store = useAppStore.getState();
      store.updateUserStats(stats);
    }
  },
};

/**
 * Error boundary handler for React Query
 * Logs errors and sends to monitoring service in production
 * @param error - The error that occurred
 * @param errorInfo - Additional error information including component stack
 */
export const queryErrorHandler = (error: Error, errorInfo: { componentStack: string }) => {
  if (typeof window !== 'undefined') {
    import('../utils/logger').then(({ logger }) => {
      logger.error('React Query Error Boundary', { error, errorInfo });
    });
  }
  
  // Log to external service in production
  if (process.env.NODE_ENV === 'production') {
    // Error tracking would be configured here with service like Sentry
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }
};

// Devtools configuration
export const devtoolsConfig = {
  initialIsOpen: false,
  position: 'bottom-right' as const,
};

export default queryClient;