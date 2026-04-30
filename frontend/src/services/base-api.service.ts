// Base API Service - Clean abstraction layer
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { API_CONFIG, AUTH_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';
import { ApiResponse, ApiError } from '../types';

class BaseApiService {
  protected client: AxiosInstance;
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor(baseURL: string = API_CONFIG.baseURL) {
    this.client = axios.create({
      baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers['X-Request-ID'] = this.generateRequestId();
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        await this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private async handleError(error: AxiosError): Promise<void> {
    const status = error.response?.status;

    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        this.handleUnauthorized();
        break;
      case HTTP_STATUS.FORBIDDEN:
        this.showError(ERROR_MESSAGES.FORBIDDEN);
        break;
      case HTTP_STATUS.TOO_MANY_REQUESTS:
        this.showError(ERROR_MESSAGES.RATE_LIMITED);
        break;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        this.showError(ERROR_MESSAGES.SERVER_ERROR);
        break;
      default:
        if (!error.response) {
          this.showError(ERROR_MESSAGES.NETWORK_ERROR);
        }
    }
  }

  private handleUnauthorized(): void {
    this.clearToken();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  private showError(message: string): void {
    // This will be overridden by toast in actual implementation
    if (typeof window !== 'undefined') {
      import('../utils/logger').then(({ logger }) => {
        logger.error('API Error', { message });
      });
    }
  }

  protected getToken(): string | null {
    return localStorage.getItem(AUTH_CONFIG.tokenKey);
  }

  protected setToken(token: string): void {
    localStorage.setItem(AUTH_CONFIG.tokenKey, token);
  }

  protected clearToken(): void {
    localStorage.removeItem(AUTH_CONFIG.tokenKey);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCacheKey(method: string, url: string, params?: Record<string, unknown>): string {
    return `${method}:${url}:${JSON.stringify(params || {})}`;
  }

  protected async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    // Prevent duplicate requests
    const cacheKey = this.getCacheKey(method, url, config.params);
    
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey);
    }

    const requestPromise = this.client
      .request<ApiResponse<T>>({
        method,
        url,
        ...config,
      })
      .then((response) => response.data)
      .finally(() => {
        this.requestQueue.delete(cacheKey);
      });

    this.requestQueue.set(cacheKey, requestPromise);
    return requestPromise;
  }

  // HTTP Methods
  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, config);
  }

  protected async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, { ...config, data });
  }

  protected async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, { ...config, data });
  }

  protected async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, { ...config, data });
  }

  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, config);
  }

  // Utility methods
  protected buildQueryString(params: Record<string, any>): string {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    });
    return query.toString();
  }

  protected handleApiError(error: unknown): ApiError {
    const err = error as { response?: { data?: { error?: { message?: string; code?: string; details?: unknown } }; status?: number }; message?: string };
    return {
      message: err.response?.data?.error?.message || err.message || 'An error occurred',
      code: err.response?.data?.error?.code || 'UNKNOWN_ERROR',
      details: err.response?.data?.error?.details,
    };
  }
}

export default BaseApiService;
