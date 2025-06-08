// Main API exports - Central point for all data fetching operations
// This file provides a tRPC/oRPC-like experience with full TypeScript safety

// Core client exports
export { apiClient, ApiClientError } from "./client";
export type { RequestConfig, ApiError } from "./client";

// Type exports
export type {
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  SearchParams,
  SearchResponse,
  QueryKeyFactory,
  CrudOperations,
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  Post,
  Comment,
  BaseEntity,
  UploadResponse,
} from "./types";

// Auth is handled by Better Auth - no need for separate auth API endpoints

// Posts API
export { postsApi, postsKeys } from "./endpoints/posts";
export type {
  CreatePostData,
  UpdatePostData,
  PostFilters,
} from "./endpoints/posts";
export {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  searchPosts,
  getPostsByAuthor,
  getPostsByTags,
  togglePostPublished,
  addPostTags,
  removePostTags,
  duplicatePost,
  getPopularPosts,
  getRecentPosts,
} from "./endpoints/posts";

// Uploads API
export { uploadsApi, uploadsKeys } from "./endpoints/uploads";
export type {
  UploadOptions,
  MultipleUploadResponse,
  UploadProgress,
} from "./endpoints/uploads";
export {
  uploadFile,
  uploadFiles,
  uploadFromUrl,
  getUpload,
  getUserUploads,
  deleteUpload,
  getSignedUploadUrl,
  getUploadStats,
  updateUpload,
  generateThumbnail,
  validateFile,
} from "./endpoints/uploads";

// Auth hooks are provided by Better Auth - use those instead

// Posts hooks
export {
  usePosts,
  useInfinitePosts,
  usePost,
  useSearchPosts,
  usePostsByAuthor,
  usePostsByTags,
  usePopularPosts,
  useRecentPosts,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
  useTogglePostPublished,
  useAddPostTags,
  useRemovePostTags,
  useDuplicatePost,
  useOptimisticUpdatePost,
  usePostsWithActions,
  usePostState,
} from "./hooks/usePosts";

// Uploads hooks
export {
  useUpload,
  useUserUploads,
  useUploadStats,
  useUploadFile,
  useUploadFiles,
  useUploadFromUrl,
  useDeleteUpload,
  useUpdateUpload,
  useGenerateThumbnail,
  useSignedUploadUrl,
  useFileUploadWithValidation,
  useDragAndDropUpload,
  useUploadQueue,
} from "./hooks/useUploads";

// API object for direct access (similar to tRPC client)
export const api = {
  posts: postsApi,
  uploads: uploadsApi,
};

// Query keys for manual cache management
export const queryKeys = {
  posts: postsKeys,
  uploads: uploadsKeys,
};

// Utility functions for common patterns
export const createQueryKey = <T extends Record<string, unknown>>(
  base: readonly string[],
  params?: T,
): readonly [string[], T?] => {
  return params ? ([base, params] as const) : ([base] as const);
};

// Error handling utilities
export const isApiError = (error: unknown): error is ApiClientError => {
  return error instanceof ApiClientError;
};

export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};

export const getErrorStatus = (error: unknown): number | undefined => {
  if (isApiError(error)) {
    return error.status;
  }
  return undefined;
};

// Default export for convenience
export default api;
