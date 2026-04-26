// Enterprise-grade global state management with Zustand

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: 'USER' | 'ADMIN';
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
  };
  stats: {
    quizzesCompleted: number;
    articlesRead: number;
    chatMessages: number;
    totalScore: number;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
  }>;
  modals: {
    [key: string]: boolean;
  };
  loading: {
    [key: string]: boolean;
  };
}

interface CacheState {
  data: {
    [key: string]: {
      value: any;
      timestamp: number;
      ttl: number;
    };
  };
}

interface AppState extends AuthState, UIState, CacheState {
  // Auth actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUserStats: (stats: Partial<User['stats']>) => void;
  
  // UI actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  setLoading: (key: string, loading: boolean) => void;
  
  // Cache actions
  setCache: (key: string, value: any, ttl?: number) => void;
  getCache: (key: string) => any;
  clearCache: (key?: string) => void;
  
  // Utility actions
  reset: () => void;
}

const initialState = {
  // Auth state
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  // UI state
  theme: 'system' as const,
  sidebarOpen: false,
  notifications: [],
  modals: {},
  loading: {},
  
  // Cache state
  data: {},
};

export const useAppStore = create<AppState>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        // Auth actions
        setUser: (user) => set((state) => {
          state.user = user;
          state.isAuthenticated = !!user;
        }),
        
        setToken: (token) => set((state) => {
          state.token = token;
        }),
        
        setAuthLoading: (loading) => set((state) => {
          state.isLoading = loading;
        }),
        
        setAuthError: (error) => set((state) => {
          state.error = error;
        }),
        
        login: (user, token) => set((state) => {
          state.user = user;
          state.token = token;
          state.isAuthenticated = true;
          state.isLoading = false;
          state.error = null;
        }),
        
        logout: () => set((state) => {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.isLoading = false;
          state.error = null;
          // Clear sensitive cache data
          state.data = {};
        }),
        
        updateUserStats: (stats) => set((state) => {
          if (state.user) {
            state.user.stats = { ...state.user.stats, ...stats };
          }
        }),
        
        // UI actions
        setTheme: (theme) => set((state) => {
          state.theme = theme;
          if (state.user) {
            state.user.preferences.theme = theme;
          }
        }),
        
        toggleSidebar: () => set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        }),
        
        setSidebarOpen: (open) => set((state) => {
          state.sidebarOpen = open;
        }),
        
        addNotification: (notification) => set((state) => {
          const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          state.notifications.unshift({
            ...notification,
            id,
            timestamp: Date.now(),
            read: false,
          });
          
          // Keep only last 50 notifications
          if (state.notifications.length > 50) {
            state.notifications = state.notifications.slice(0, 50);
          }
        }),
        
        removeNotification: (id) => set((state) => {
          state.notifications = state.notifications.filter(n => n.id !== id);
        }),
        
        markNotificationRead: (id) => set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          if (notification) {
            notification.read = true;
          }
        }),
        
        clearNotifications: () => set((state) => {
          state.notifications = [];
        }),
        
        openModal: (modalId) => set((state) => {
          state.modals[modalId] = true;
        }),
        
        closeModal: (modalId) => set((state) => {
          state.modals[modalId] = false;
        }),
        
        setLoading: (key, loading) => set((state) => {
          state.loading[key] = loading;
        }),
        
        // Cache actions
        setCache: (key, value, ttl = 300000) => set((state) => { // 5 minutes default
          state.data[key] = {
            value,
            timestamp: Date.now(),
            ttl,
          };
        }),
        
        getCache: (key) => {
          const cached = get().data[key];
          if (!cached) return null;
          
          const now = Date.now();
          if (now - cached.timestamp > cached.ttl) {
            // Cache expired, remove it
            set((state) => {
              delete state.data[key];
            });
            return null;
          }
          
          return cached.value;
        },
        
        clearCache: (key) => set((state) => {
          if (key) {
            delete state.data[key];
          } else {
            state.data = {};
          }
        }),
        
        // Utility actions
        reset: () => set(() => ({ ...initialState })),
      })),
      {
        name: 'election-education-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // Only persist certain parts of the state
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
          theme: state.theme,
          // Don't persist loading states, errors, or cache
        }),
        version: 1,
        migrate: (persistedState: any, version: number) => {
          // Handle state migrations if needed
          if (version === 0) {
            // Migration from version 0 to 1
            return {
              ...persistedState,
              theme: persistedState.theme || 'system',
            };
          }
          return persistedState;
        },
      }
    )
  )
);

// Selectors for optimized re-renders
export const useAuth = () => useAppStore((state) => ({
  user: state.user,
  token: state.token,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  error: state.error,
  login: state.login,
  logout: state.logout,
  setAuthLoading: state.setAuthLoading,
  setAuthError: state.setAuthError,
  updateUserStats: state.updateUserStats,
}));

export const useUI = () => useAppStore((state) => ({
  theme: state.theme,
  sidebarOpen: state.sidebarOpen,
  notifications: state.notifications,
  modals: state.modals,
  loading: state.loading,
  setTheme: state.setTheme,
  toggleSidebar: state.toggleSidebar,
  setSidebarOpen: state.setSidebarOpen,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  markNotificationRead: state.markNotificationRead,
  clearNotifications: state.clearNotifications,
  openModal: state.openModal,
  closeModal: state.closeModal,
  setLoading: state.setLoading,
}));

export const useCache = () => useAppStore((state) => ({
  setCache: state.setCache,
  getCache: state.getCache,
  clearCache: state.clearCache,
}));

// Subscribe to auth changes for side effects
useAppStore.subscribe(
  (state) => state.isAuthenticated,
  (isAuthenticated) => {
    if (!isAuthenticated) {
      // Clear sensitive data on logout
      useAppStore.getState().clearCache();
    }
  }
);

// Subscribe to theme changes
useAppStore.subscribe(
  (state) => state.theme,
  (theme) => {
    // Apply theme to document
    const root = document.documentElement;
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }
);

export default useAppStore;