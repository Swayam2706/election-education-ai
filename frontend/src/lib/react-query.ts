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
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
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
  onError: (error: any, query) => {
    // Log query errors
    console.error('Query error:', {
      queryKey: query.queryKey,
      error: error.message,
      status: error?.response?.status,
    });

    // Don't show toast for background refetches
    if (query.state.data !== undefined) {
      return;
    }

    // Show error toast for failed queries
    const errorMessage = error?.response?.data?.error?.message || error.message || 'Something went wrong';
    toast.error(errorMessage);
  },
  
  onSuccess: (data, query) => {
    // Log successful queries in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Query success:', {
        queryKey: query.queryKey,
        data,
      });
    }
  },
});

// Mutation cache configuration
const mutationCache = new MutationCache({
  onError: (error: any, variables, context, mutation) => {
    // Log mutation errors
    console.error('Mutation error:', {
      mutationKey: mutation.options.mutationKey,
      error: error.message,
      status: error?.response?.status,
      variables,
    });

    // Show error toast (unless explicitly disabled)
    if (!mutation.options.meta?.skipErrorToast) {
      const errorMessage = error?.response?.data?.error?.message || error.message || 'Operation failed';
      toast.error(errorMessage);
    }
  },
  
  onSuccess: (data, variables, context, mutation) => {
    // Log successful mutations in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Mutation success:', {
        mutationKey: mutation.options.mutationKey,
        data,
        variables,
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
    list: (filters?: any) => ['users', 'list', filters] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    stats: (id: string) => ['users', 'stats', id] as const,
  },
  
  // Content
  content: {
    all: () => ['content'] as const,
    list: (type?: string, filters?: any) => ['content', 'list', type, filters] as const,
    detail: (id: string) => ['content', 'detail', id] as const,
    search: (query: string, filters?: any) => ['content', 'search', query, filters] as const,
  },
  
  // Quizzes
  quizzes: {
    all: () => ['quizzes'] as const,
    list: (filters?: any) => ['quizzes', 'list', filters] as const,
    detail: (id: string) => ['quizzes', 'detail', id] as const,
    attempts: (userId: string) => ['quizzes', 'attempts', userId] as const,
    attempt: (id: string) => ['quizzes', 'attempt', id] as const,
  },
  
  // Timeline
  timeline: {
    all: () => ['timeline'] as const,
    events: (filters?: any) => ['timeline', 'events', filters] as const,
    event: (id: string) => ['timeline', 'event', id] as const,
  },
  
  // FAQ
  faq: {
    all: () => ['faq'] as const,
    list: (filters?: any) => ['faq', 'list', filters] as const,
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
    users: (filters?: any) => ['admin', 'users', filters] as const,
    content: (filters?: any) => ['admin', 'content', filters] as const,
    analytics: () => ['admin', 'analytics'] as const,
    logs: (filters?: any) => ['admin', 'logs', filters] as const,
  },
};

// Utility functions for cache management
export const cacheUtils = {
  // Invalidate all queries for a specific key pattern
  invalidateQueries: (queryKey: any[]) => {
    return queryClient.invalidateQueries({ queryKey });
  },
  
  // Remove specific query from cache
  removeQueries: (queryKey: any[]) => {
    return queryClient.removeQueries({ queryKey });
  },
  
  // Set query data manually
  setQueryData: <T>(queryKey: any[], data: T) => {
    return queryClient.setQueryData(queryKey, data);
  },
  
  // Get query data from cache
  getQueryData: <T>(queryKey: any[]): T | undefined => {
    return queryClient.getQueryData(queryKey);
  },
  
  // Prefetch query
  prefetchQuery: (queryKey: any[], queryFn: () => Promise<any>) => {
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
  updateUserStats: (userId: string, stats: any) => {
    const userKey = queryKeys.users.detail(userId);
    const currentData = queryClient.getQueryData(userKey) as any;
    
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
    const authData = queryClient.getQueryData(authKey) as any;
    
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

// Error boundary for React Query
export const queryErrorHandler = (error: Error, errorInfo: any) => {
  console.error('React Query Error Boundary:', error, errorInfo);
  
  // Log to external service in production
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  }
};

// Devtools configuration
export const devtoolsConfig = {
  initialIsOpen: false,
  position: 'bottom-right' as const,
};

export default queryClient;