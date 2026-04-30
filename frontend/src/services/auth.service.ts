/**
 * Enterprise Authentication Service
 * Handles user authentication, session management, and token refresh
 * Provides secure authentication with automatic token refresh and error handling
 */

import { apiService } from './api.service';
import { useAppStore } from '../store/useAppStore';
import toast from 'react-hot-toast';

// Types
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

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
  createdAt?: string;
  updatedAt?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface FirebaseSyncData {
  firebaseUid: string;
  email: string;
  name?: string;
  image?: string;
  token: string;
}

class AuthService {
  private tokenKey = 'auth_token';
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize authentication on app start
   * Checks for stored token and validates with backend
   * @private
   */
  private async initializeAuth(): Promise<void> {
    const store = useAppStore.getState();
    const token = this.getStoredToken();

    if (token) {
      store.setToken(token);
      store.setAuthLoading(true);

      try {
        const response = await apiService.get<{ user: User }>('/auth/me');
        
        if (response.success && response.data) {
          store.setUser(response.data.user);
          this.setupTokenRefresh();
        } else {
          this.clearAuth();
        }
      } catch (error) {
        if (typeof window !== 'undefined') {
          import('../utils/logger').then(({ logger }) => {
            logger.error('Auth initialization failed', error);
          });
        }
        this.clearAuth();
      } finally {
        store.setAuthLoading(false);
      }
    } else {
      store.setAuthLoading(false);
    }
  }

  /**
   * Login with email and password
   * @param credentials - User login credentials
   * @param credentials.email - User email address
   * @param credentials.password - User password
   * @returns Promise with authenticated user and token
   * @throws Error if login fails
   * @example
   * ```ts
   * const { user, token } = await authService.login({
   *   email: 'user@example.com',
   *   password: 'password123'
   * });
   * ```
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const store = useAppStore.getState();
    store.setAuthLoading(true);
    store.setAuthError(null);

    try {
      const response = await apiService.post<AuthResponse>('/auth/login', credentials);

      if (response.success && response.data) {
        const { user, token } = response.data;
        
        this.storeToken(token);
        store.login(user, token);
        this.setupTokenRefresh();
        
        toast.success(`Welcome back, ${user.name}!`);
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Login failed');
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      const errorMessage = apiError.response?.data?.error?.message || apiError.message || 'Login failed';
      store.setAuthError(errorMessage);
      throw error;
    } finally {
      store.setAuthLoading(false);
    }
  }

  /**
   * Register a new user account
   * @param data - User registration data
   * @param data.email - User email address
   * @param data.password - User password
   * @param data.confirmPassword - Password confirmation
   * @param data.name - User display name
   * @returns Promise with authenticated user and token
   * @throws Error if registration fails
   * @example
   * ```ts
   * const { user, token } = await authService.register({
   *   email: 'newuser@example.com',
   *   password: 'password123',
   *   confirmPassword: 'password123',
   *   name: 'John Doe'
   * });
   * ```
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const store = useAppStore.getState();
    store.setAuthLoading(true);
    store.setAuthError(null);

    try {
      const response = await apiService.post<AuthResponse>('/auth/register', data);

      if (response.success && response.data) {
        const { user, token } = response.data;
        
        this.storeToken(token);
        store.login(user, token);
        this.setupTokenRefresh();
        
        toast.success(`Welcome to Election Education, ${user.name}!`);
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Registration failed');
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      const errorMessage = apiError.response?.data?.error?.message || apiError.message || 'Registration failed';
      store.setAuthError(errorMessage);
      throw error;
    } finally {
      store.setAuthLoading(false);
    }
  }

  /**
   * Sync Firebase authentication with backend
   * @param data - Firebase sync data
   * @param data.firebaseUid - Firebase user ID
   * @param data.email - User email
   * @param data.name - User display name (optional)
   * @param data.image - User profile image URL (optional)
   * @param data.token - Firebase ID token
   * @returns Promise with authenticated user and backend token
   * @throws Error if sync fails
   */
  async firebaseSync(data: FirebaseSyncData): Promise<AuthResponse> {
    const store = useAppStore.getState();
    store.setAuthLoading(true);
    store.setAuthError(null);

    try {
      const response = await apiService.post<AuthResponse>('/auth/firebase-sync', data);

      if (response.success && response.data) {
        const { user, token } = response.data;
        
        this.storeToken(token);
        store.login(user, token);
        this.setupTokenRefresh();
        
        toast.success(`Welcome, ${user.name}!`);
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Firebase sync failed');
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      const errorMessage = apiError.response?.data?.error?.message || apiError.message || 'Firebase sync failed';
      store.setAuthError(errorMessage);
      throw error;
    } finally {
      store.setAuthLoading(false);
    }
  }

  /**
   * Logout the current user
   * Clears authentication state and notifies backend
   * @returns Promise that resolves when logout is complete
   */
  async logout(): Promise<void> {
    const store = useAppStore.getState();

    try {
      // Notify server about logout
      await apiService.post('/auth/logout', {}, { skipErrorToast: true });
    } catch (error) {
      // Ignore logout errors - user is logging out anyway
      if (typeof window !== 'undefined') {
        import('../utils/logger').then(({ logger }) => {
          logger.warn('Logout request failed', error);
        });
      }
    }

    this.clearAuth();
    toast.success('Logged out successfully');
  }

  /**
   * Update user profile information
   * @param data - Partial user data to update
   * @param data.name - Updated display name (optional)
   * @param data.image - Updated profile image URL (optional)
   * @param data.preferences - Updated user preferences (optional)
   * @returns Promise with updated user data
   * @throws Error if update fails
   */
  async updateProfile(data: Partial<Pick<User, 'name' | 'image' | 'preferences'>>): Promise<User> {
    const store = useAppStore.getState();

    try {
      const response = await apiService.put<{ user: User }>('/auth/profile', data);

      if (response.success && response.data) {
        store.setUser(response.data.user);
        toast.success('Profile updated successfully');
        return response.data.user;
      } else {
        throw new Error(response.error?.message || 'Profile update failed');
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      const errorMessage = apiError.response?.data?.error?.message || apiError.message || 'Profile update failed';
      toast.error(errorMessage);
      throw error;
    }
  }

  /**
   * Change user password
   * @param data - Password change data
   * @param data.currentPassword - Current password for verification
   * @param data.newPassword - New password
   * @param data.confirmPassword - New password confirmation
   * @returns Promise that resolves when password is changed
   * @throws Error if password change fails
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> {
    try {
      const response = await apiService.put('/auth/password', data);

      if (response.success) {
        toast.success('Password changed successfully');
      } else {
        throw new Error(response.error?.message || 'Password change failed');
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      const errorMessage = apiError.response?.data?.error?.message || apiError.message || 'Password change failed';
      toast.error(errorMessage);
      throw error;
    }
  }

  /**
   * Check if an email address is available for registration
   * @param email - Email address to check
   * @returns Promise with boolean indicating availability
   * @example
   * ```ts
   * const isAvailable = await authService.checkEmailAvailability('test@example.com');
   * if (isAvailable) {
   *   // Email can be used for registration
   * }
   * ```
   */
  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const response = await apiService.post<{ available: boolean }>('/auth/check-email', 
        { email }, 
        { skipErrorToast: true }
      );

      return response.success && response.data ? response.data.available : false;
    } catch (error) {
      if (typeof window !== 'undefined') {
        import('../utils/logger').then(({ logger }) => {
          logger.error('Email availability check failed', error);
        });
      }
      return false;
    }
  }

  /**
   * Refresh the authentication token
   * @returns Promise with new token or null if refresh fails
   * @description Automatically called when token is about to expire
   */
  async refreshToken(): Promise<string | null> {
    try {
      const response = await apiService.post<{ token: string }>('/auth/refresh');

      if (response.success && response.data) {
        const { token } = response.data;
        this.storeToken(token);
        useAppStore.getState().setToken(token);
        return token;
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        import('../utils/logger').then(({ logger }) => {
          logger.error('Token refresh failed', error);
        });
      }
      this.clearAuth();
    }

    return null;
  }

  /**
   * Get the current authenticated user
   * @returns Promise with user data or null if not authenticated
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiService.get<{ user: User }>('/auth/me');

      if (response.success && response.data) {
        const store = useAppStore.getState();
        store.setUser(response.data.user);
        return response.data.user;
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        import('../utils/logger').then(({ logger }) => {
          logger.error('Get current user failed', error);
        });
      }
      this.clearAuth();
    }

    return null;
  }

  /**
   * Update user statistics (quizzes completed, articles read, etc.)
   * @param stats - Partial statistics to update
   * @description Updates local state only, backend sync happens automatically
   */
  updateUserStats(stats: Partial<User['stats']>): void {
    const store = useAppStore.getState();
    store.updateUserStats(stats);
  }

  /**
   * Store authentication token in local storage
   * @param token - JWT token to store
   * @private
   */
  private storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private clearStoredToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * Clear all authentication data
   * @private
   */
  private clearAuth(): void {
    this.clearStoredToken();
    this.clearTokenRefresh();
    
    const store = useAppStore.getState();
    store.logout();
    
    // Clear API cache
    apiService.clearCache();
  }

  /**
   * Setup automatic token refresh
   * @private
   * @description Refreshes token every 6 hours and before expiry
   */
  private setupTokenRefresh(): void {
    this.clearTokenRefresh();

    // Refresh token every 6 hours (JWT expires in 7 days, so this is safe)
    // Also refresh 1 hour before expiry if user is active
    this.refreshTimer = setInterval(() => {
      this.refreshToken();
    }, 6 * 60 * 60 * 1000); // 6 hours

    // Set up automatic refresh before token expiry
    // JWT tokens expire in 7 days, refresh after 6 days
    setTimeout(() => {
      this.refreshToken();
    }, 6 * 24 * 60 * 60 * 1000); // 6 days
  }

  private clearTokenRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Check if token needs refresh
   * @returns Boolean indicating if token should be refreshed
   * @private
   */
  private shouldRefreshToken(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;

    try {
      // Decode JWT to check expiry (basic check without verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - now;
      
      // Refresh if token expires in less than 1 hour
      return timeUntilExpiry < 3600;
    } catch {
      return false;
    }
  }

  /**
   * Auto-refresh token if needed
   * @description Called from API interceptor before each request
   */
  async autoRefreshIfNeeded(): Promise<void> {
    if (this.shouldRefreshToken()) {
      await this.refreshToken();
    }
  }

  /**
   * Check if user is authenticated
   * @returns Boolean indicating authentication status
   */
  isAuthenticated(): boolean {
    const store = useAppStore.getState();
    return store.isAuthenticated && !!store.token;
  }

  /**
   * Check if user has a specific role
   * @param role - Role name to check
   * @returns Boolean indicating if user has the role
   */
  hasRole(role: string): boolean {
    const store = useAppStore.getState();
    return store.user?.role === role;
  }

  /**
   * Check if user is an admin
   * @returns Boolean indicating admin status
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * Get the current authenticated user from store
   * @returns User object or null if not authenticated
   */
  getUser(): User | null {
    const store = useAppStore.getState();
    return store.user;
  }

  /**
   * Get the current authentication token from store
   * @returns JWT token or null if not authenticated
   */
  getToken(): string | null {
    const store = useAppStore.getState();
    return store.token;
  }
}

// Create singleton instance
export const authService = new AuthService();

// Export for use in components
export default authService;