// API Configuration
// Central configuration for all API-related settings

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  enableLogging: boolean;
  enableDevtools: boolean;
  endpoints: {
    auth: string;
    posts: string;
    uploads: string;
    users: string;
    comments: string;
  };
  cache: {
    defaultStaleTime: number;
    authStaleTime: number;
    searchStaleTime: number;
  };
  auth: {
    tokenKey: string;
    refreshTokenKey: string;
    tokenPrefix: string;
  };
}

// Environment-based configuration
const getApiConfig = (): ApiConfig => {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  // Base URL configuration
  const getBaseUrl = (): string => {
    // Check for explicit environment variable first
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }

    // Development defaults
    if (isDevelopment) {
      return import.meta.env.VITE_DEV_API_URL || 'http://localhost:3001/api';
    }

    // Production defaults
    if (isProduction) {
      return import.meta.env.VITE_PROD_API_URL || '/api';
    }

    // Fallback
    return '/api';
  };

  return {
    baseUrl: getBaseUrl(),
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),
    retries: parseInt(import.meta.env.VITE_API_RETRIES || '2', 10),
    enableLogging: isDevelopment || import.meta.env.VITE_ENABLE_API_LOGGING === 'true',
    enableDevtools: isDevelopment || import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',

    endpoints: {
      auth: '/auth',
      posts: '/posts',
      uploads: '/uploads',
      users: '/users',
      comments: '/comments',
    },

    cache: {
      // Default cache times (in milliseconds)
      defaultStaleTime: parseInt(import.meta.env.VITE_DEFAULT_STALE_TIME || '300000', 10), // 5 minutes
      authStaleTime: parseInt(import.meta.env.VITE_AUTH_STALE_TIME || '900000', 10), // 15 minutes
      searchStaleTime: parseInt(import.meta.env.VITE_SEARCH_STALE_TIME || '30000', 10), // 30 seconds
    },

    auth: {
      tokenKey: import.meta.env.VITE_AUTH_TOKEN_KEY || 'auth_token',
      refreshTokenKey: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'refresh_token',
      tokenPrefix: import.meta.env.VITE_TOKEN_PREFIX || 'Bearer',
    },
  };
};

// Export the configuration
export const config = getApiConfig();

// Environment helpers
export const isDev = import.meta.env.DEV;
export const isProd = import.meta.env.PROD;
export const isTest = import.meta.env.MODE === 'test';

// API endpoint builders
export const buildApiUrl = (endpoint: string, path?: string): string => {
  const base = config.baseUrl;
  const fullPath = path ? `${endpoint}${path}` : endpoint;
  return `${base}${fullPath}`.replace(/\/+/g, '/').replace(/\/$/, '');
};

// Cache time helpers
export const getCacheTime = (type: 'default' | 'auth' | 'search' = 'default'): number => {
  switch (type) {
    case 'auth':
      return config.cache.authStaleTime;
    case 'search':
      return config.cache.searchStaleTime;
    default:
      return config.cache.defaultStaleTime;
  }
};

// Validation helpers
export const validateConfig = (): void => {
  const requiredEnvVars = ['VITE_API_BASE_URL'];
  const missingVars = requiredEnvVars.filter(
    (varName) => !import.meta.env[varName] && isProd
  );

  if (missingVars.length > 0 && isProd) {
    console.warn(
      `Missing required environment variables in production: ${missingVars.join(', ')}`
    );
  }

  if (config.timeout < 1000) {
    console.warn('API timeout is set to less than 1 second, this might cause issues');
  }

  if (config.retries > 5) {
    console.warn('API retries set to more than 5, this might cause delays');
  }
};

// Initialize configuration validation
if (typeof window !== 'undefined') {
  validateConfig();
}

// Export default config
export default config;
