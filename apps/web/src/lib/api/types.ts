// Base API response wrapper
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

// API Error types
export interface ApiError {
  message: string;
  code?: string | number;
  details?: Record<string, unknown>;
  status?: number;
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Base request configuration
export interface RequestConfig {
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
  retry?: {
    limit: number;
    methods: HttpMethod[];
    statusCodes: number[];
  };
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Query key factory type
export type QueryKeyFactory<T extends Record<string, unknown> = Record<string, unknown>> = {
  all: readonly string[];
  lists: () => readonly [...QueryKeyFactory<T>['all'], 'list'];
  list: (filters?: T) => readonly [...ReturnType<QueryKeyFactory<T>['lists']>, T?];
  details: () => readonly [...QueryKeyFactory<T>['all'], 'detail'];
  detail: (id: string | number) => readonly [...ReturnType<QueryKeyFactory<T>['details']>, string | number];
};

// Generic CRUD operations
export interface CrudOperations<T, CreateT = Omit<T, 'id'>, UpdateT = Partial<CreateT>> {
  getAll: (params?: PaginationParams & Record<string, unknown>) => Promise<ApiResponse<PaginatedResponse<T>>>;
  getById: (id: string | number) => Promise<ApiResponse<T>>;
  create: (data: CreateT) => Promise<ApiResponse<T>>;
  update: (id: string | number, data: UpdateT) => Promise<ApiResponse<T>>;
  delete: (id: string | number) => Promise<ApiResponse<void>>;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Common entity types (you can extend these based on your needs)
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Example entities - replace with your actual data models
export interface Post extends BaseEntity {
  title: string;
  content: string;
  authorId: string;
  published: boolean;
  tags: string[];
}

export interface Comment extends BaseEntity {
  content: string;
  postId: string;
  authorId: string;
}

// Utility types for API endpoints
export type EndpointConfig<TParams = void, TResponse = unknown> = {
  path: string;
  method: HttpMethod;
  params?: TParams;
  response?: TResponse;
};

// Upload types
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

// Search types
export interface SearchParams {
  query: string;
  filters?: Record<string, unknown>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface SearchResponse<T> extends PaginatedResponse<T> {
  query: string;
  totalMatches: number;
}
