// Enterprise API Service Layer

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';

// Types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipErrorToast?: boolean;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
}

class ApiService {
  private client: AxiosInstance;
  private baseURL: string;
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const store = useAppStore.getState();
        
        // Auto-refresh token if needed (before making request)
        if (!(config as any)?.skipAuth && store.token) {
          try {
            const { authService } = await import('./auth.service');
            await authService.autoRefreshIfNeeded();
          } catch (error) {
            console.warn('Auto-refresh failed:', error);
          }
        }
        
        // Add auth token if available and not skipped
        if (!(config as any)?.skipAuth && store.token) {
          config.headers.Authorization = `Bearer ${store.token}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params,
          });
        }

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as RequestConfig;
        
        // Log error in development
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ API Error: ${config?.method?.toUpperCase()} ${config?.url}`, {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          });
        }

        // Handle specific error cases
        if (error.response?.status === 401) {
          // Unauthorized - clear auth and redirect to login
          const store = useAppStore.getState();
          store.logout();
          
          if (!(config as any)?.skipErrorToast) {
            toast.error('Session expired. Please log in again.');
          }
          
          // Redirect to login if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        } else if (error.response?.status === 403) {
          // Forbidden
          if (!config?.skipErrorToast) {
            toast.error('You do not have permission to perform this action.');
          }
        } else if (error.response?.status === 429) {
          // Rate limited
          if (!config?.skipErrorToast) {
            toast.error('Too many requests. Please try again later.');
          }
        } else if (error.response?.status >= 500) {
          // Server error
          if (!config?.skipErrorToast) {
            toast.error('Server error. Please try again later.');
          }
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          // Network error
          if (!config?.skipErrorToast) {
            toast.error('Network error. Please check your connection.');
          }
        } else if (!config?.skipErrorToast) {
          // Other errors
          const errorMessage = (error as any).response?.data?.error?.message || (error as any).message || 'An error occurred';
          toast.error(errorMessage);
        }

        // Retry logic
        if (this.shouldRetry(error) && config && (config.retries || 0) > 0) {
          config.retries = (config.retries || 0) - 1;
          
          // Exponential backoff
          const delay = Math.pow(2, 3 - (config.retries || 0)) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return this.client.request(config);
        }

        return Promise.reject(error);
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors or 5xx server errors
    return (
      !error.response ||
      error.code === 'NETWORK_ERROR' ||
      (error.response.status >= 500 && error.response.status < 600)
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCacheKey(method: string, url: string, params?: any, data?: any): string {
    let key = `${method}:${url}`;
    if (params) {
      key += `:params:${JSON.stringify(params)}`;
    }
    if (data) {
      key += `:data:${JSON.stringify(data)}`;
    }
    return key;
  }

  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { cache = false, cacheTTL = 300000, retries = 3, ...axiosConfig } = config;

    // Check cache for GET requests
    if (method === 'GET' && cache) {
      const cacheKey = this.getCacheKey(method, url, axiosConfig.params, axiosConfig.data);
      const store = useAppStore.getState();
      const cached = store.getCache(cacheKey);
      
      if (cached) {
        return cached;
      }
    }

    // Prevent duplicate requests
    const requestKey = this.getCacheKey(method, url, axiosConfig.params, axiosConfig.data);
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey);
    }

    const requestPromise = this.client.request<ApiResponse<T>>({
      method,
      url,
      ...(retries !== undefined && { retries } as any),
      ...axiosConfig,
    }).then((response) => {
      const result = response.data;
      
      // Cache successful GET requests
      if (method === 'GET' && cache && (result as any).success) {
        const cacheKey = this.getCacheKey(method, url, axiosConfig.params, axiosConfig.data);
        const store = useAppStore.getState();
        store.setCache(cacheKey, result, cacheTTL);
      }
      
      return result as ApiResponse<T>;
    }).finally(() => {
      this.requestQueue.delete(requestKey);
    });

    this.requestQueue.set(requestKey, requestPromise);
    return requestPromise;
  }

  // HTTP Methods
  async get<T>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', url, config);
  }

  async post<T>(url: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', url, { ...config, data });
  }

  async put<T>(url: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', url, { ...config, data });
  }

  async patch<T>(url: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PATCH', url, { ...config, data });
  }

  async delete<T>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', url, config);
  }

  // File upload
  async upload<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.makeRequest<T>('POST', url, {
      ...config,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  // Batch requests
  async batch<T>(requests: Array<() => Promise<ApiResponse<T>>>): Promise<ApiResponse<T>[]> {
    try {
      const results = await Promise.allSettled(requests.map(req => req()));
      
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error(`Batch request ${index} failed:`, result.reason);
          return {
            success: false,
            error: {
              message: 'Request failed',
              code: 'BATCH_REQUEST_FAILED',
            },
          };
        }
      });
    } catch (error) {
      console.error('Batch request error:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health', { 
        skipAuth: true, 
        skipErrorToast: true,
        timeout: 5000,
      });
      return response.success;
    } catch {
      return false;
    }
  }

  // Clear all caches
  clearCache(): void {
    const store = useAppStore.getState();
    store.clearCache();
  }

  // Update base URL
  setBaseURL(url: string): void {
    this.baseURL = url;
    this.client.defaults.baseURL = url;
  }

  // Get current base URL
  getBaseURL(): string {
    return this.baseURL;
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export for use in other services
export default apiService;