// Enterprise Authentication Service

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

  // Initialize authentication on app start
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
        console.error('Auth initialization failed:', error);
        this.clearAuth();
      } finally {
        store.setAuthLoading(false);
      }
    } else {
      store.setAuthLoading(false);
    }
  }

  // Login with email and password
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

  // Register new user
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

  // Firebase authentication sync
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

  // Logout
  async logout(): Promise<void> {
    const store = useAppStore.getState();

    try {
      // Notify server about logout
      await apiService.post('/auth/logout', {}, { skipErrorToast: true });
    } catch (error) {
      // Ignore logout errors
      console.warn('Logout request failed:', error);
    }

    this.clearAuth();
    toast.success('Logged out successfully');
  }

  // Update user profile
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

  // Change password
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

  // Check email availability
  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const response = await apiService.post<{ available: boolean }>('/auth/check-email', 
        { email }, 
        { skipErrorToast: true }
      );

      return response.success && response.data ? response.data.available : false;
    } catch (error) {
      console.error('Email availability check failed:', error);
      return false;
    }
  }

  // Refresh token
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
      console.error('Token refresh failed:', error);
      this.clearAuth();
    }

    return null;
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiService.get<{ user: User }>('/auth/me');

      if (response.success && response.data) {
        const store = useAppStore.getState();
        store.setUser(response.data.user);
        return response.data.user;
      }
    } catch (error) {
      console.error('Get current user failed:', error);
      this.clearAuth();
    }

    return null;
  }

  // Update user statistics
  updateUserStats(stats: Partial<User['stats']>): void {
    const store = useAppStore.getState();
    store.updateUserStats(stats);
  }

  // Token management
  private storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private clearStoredToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // Clear all auth data
  private clearAuth(): void {
    this.clearStoredToken();
    this.clearTokenRefresh();
    
    const store = useAppStore.getState();
    store.logout();
    
    // Clear API cache
    apiService.clearCache();
  }

  // Token refresh setup
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

  // Check if token needs refresh (call this on API requests)
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

  // Auto-refresh token if needed (call this from API interceptor)
  async autoRefreshIfNeeded(): Promise<void> {
    if (this.shouldRefreshToken()) {
      await this.refreshToken();
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const store = useAppStore.getState();
    return store.isAuthenticated && !!store.token;
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const store = useAppStore.getState();
    return store.user?.role === role;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  // Get current user
  getUser(): User | null {
    const store = useAppStore.getState();
    return store.user;
  }

  // Get current token
  getToken(): string | null {
    const store = useAppStore.getState();
    return store.token;
  }
}

// Create singleton instance
export const authService = new AuthService();

// Export for use in components
export default authService;