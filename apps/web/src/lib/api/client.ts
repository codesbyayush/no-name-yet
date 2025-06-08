import ky, { type KyInstance, type Options } from 'ky';
import type { ApiResponse, ApiError, RequestConfig } from './types';

// Environment configuration
const getBaseUrl = (): string => {
  // You can customize this based on your environment
  if (typeof window === 'undefined') {
    // Server-side
    return process.env.API_BASE_URL || 'http://localhost:3001/api';
  }

  // Client-side
  return import.meta.env.VITE_API_BASE_URL || '/api';
};

// Custom error class for API errors
export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code?: string | number;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, status: number, code?: string | number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Default configuration
const defaultConfig: RequestConfig = {
  timeout: 30000,
  retries: 2,
  retry: {
    limit: 2,
    methods: ['GET'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
};

// Create the base Ky instance
const createHttpClient = (config: RequestConfig = {}): KyInstance => {
  const mergedConfig = { ...defaultConfig, ...config };

  return ky.create({
    prefixUrl: getBaseUrl(),
    timeout: mergedConfig.timeout,
    retry: mergedConfig.retry,
    headers: {
      'Content-Type': 'application/json',
      ...mergedConfig.headers,
    },
    hooks: {
      beforeRequest: [
        (request) => {
          // Add auth token if available
          const token = getAuthToken();
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`);
          }

          // Add request ID for tracing
          request.headers.set('X-Request-ID', generateRequestId());

          // Log request in development
          if (import.meta.env.DEV) {
            console.log(`🚀 API Request: ${request.method} ${request.url}`);
          }
        },
      ],
      beforeRetry: [
        ({ request, options, error, retryCount }) => {
          if (import.meta.env.DEV) {
            console.log(`🔄 Retrying request (${retryCount}): ${request.method} ${request.url}`, error);
          }
        },
      ],
      afterResponse: [
        (request, options, response) => {
          if (import.meta.env.DEV) {
            console.log(`✅ API Response: ${request.method} ${request.url} - ${response.status}`);
          }
          return response;
        },
      ],
      beforeError: [
        async (error) => {
          const { request, response } = error;

          if (response) {
            let errorData: ApiError;

            try {
              errorData = await response.json();
            } catch {
              errorData = {
                message: response.statusText || 'An error occurred',
                status: response.status,
              };
            }

            // Handle specific error cases
            if (response.status === 401) {
              // Handle unauthorized - clear auth token
              clearAuthToken();

              // Optionally redirect to login
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('auth:unauthorized'));
              }
            }

            throw new ApiClientError(
              errorData.message || 'Request failed',
              response.status,
              errorData.code,
              errorData.details
            );
          }

          // Network or other errors
          throw new ApiClientError(
            error.message || 'Network error occurred',
            0,
            'NETWORK_ERROR'
          );
        },
      ],
    },
  });
};

// Auth token management
const AUTH_TOKEN_KEY = 'auth_token';

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

const clearAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

// Utility functions
const generateRequestId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Main API client class
export class ApiClient {
  private httpClient: KyInstance;

  constructor(config?: RequestConfig) {
    this.httpClient = createHttpClient(config);
  }

  // Generic request methods
  async get<T = unknown>(url: string, options?: Options): Promise<T> {
    const response = await this.httpClient.get(url, options).json<ApiResponse<T>>();
    return response.data;
  }

  async post<T = unknown>(url: string, data?: unknown, options?: Options): Promise<T> {
    const response = await this.httpClient.post(url, { json: data, ...options }).json<ApiResponse<T>>();
    return response.data;
  }

  async put<T = unknown>(url: string, data?: unknown, options?: Options): Promise<T> {
    const response = await this.httpClient.put(url, { json: data, ...options }).json<ApiResponse<T>>();
    return response.data;
  }

  async patch<T = unknown>(url: string, data?: unknown, options?: Options): Promise<T> {
    const response = await this.httpClient.patch(url, { json: data, ...options }).json<ApiResponse<T>>();
    return response.data;
  }

  async delete<T = unknown>(url: string, options?: Options): Promise<T> {
    const response = await this.httpClient.delete(url, options).json<ApiResponse<T>>();
    return response.data;
  }

  // Raw response methods (when you need full response data)
  async getRaw<T = unknown>(url: string, options?: Options): Promise<ApiResponse<T>> {
    return this.httpClient.get(url, options).json<ApiResponse<T>>();
  }

  async postRaw<T = unknown>(url: string, data?: unknown, options?: Options): Promise<ApiResponse<T>> {
    return this.httpClient.post(url, { json: data, ...options }).json<ApiResponse<T>>();
  }

  // File upload method
  async upload<T = unknown>(url: string, formData: FormData, options?: Options): Promise<T> {
    const response = await this.httpClient.post(url, { body: formData, ...options }).json<ApiResponse<T>>();
    return response.data;
  }

  // Stream method for large responses
  async stream(url: string, options?: Options): Promise<ReadableStream> {
    const response = await this.httpClient.get(url, options);
    if (!response.body) {
      throw new ApiClientError('No response body available for streaming', 500);
    }
    return response.body;
  }

  // Auth token methods
  setAuthToken(token: string): void {
    setAuthToken(token);
    // Recreate client with new token
    this.httpClient = createHttpClient();
  }

  clearAuthToken(): void {
    clearAuthToken();
    // Recreate client without token
    this.httpClient = createHttpClient();
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get('/health');
  }
}

// Create and export a default client instance
export const apiClient = new ApiClient();

// Export utilities for advanced usage
export { getAuthToken, setAuthToken, clearAuthToken, ApiClientError };

// Export types
export type { RequestConfig, ApiError };
