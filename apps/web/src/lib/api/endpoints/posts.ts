import { apiClient } from '../client';
import type {
  Post,
  PaginatedResponse,
  PaginationParams,
  QueryKeyFactory,
  CrudOperations,
  SearchParams,
  SearchResponse
} from '../types';

// Posts query keys factory
export const postsKeys: QueryKeyFactory<{ search?: string; authorId?: string; tags?: string[] }> = {
  all: ['posts'] as const,
  lists: () => [...postsKeys.all, 'list'] as const,
  list: (filters?: { search?: string; authorId?: string; tags?: string[] }) => [...postsKeys.lists(), filters] as const,
  details: () => [...postsKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...postsKeys.details(), id] as const,
};

// Post-specific types
export interface CreatePostData {
  title: string;
  content: string;
  published?: boolean;
  tags?: string[];
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  published?: boolean;
  tags?: string[];
}

export interface PostFilters extends PaginationParams {
  authorId?: string;
  published?: boolean;
  tags?: string[];
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Posts API endpoints
export const postsApi: CrudOperations<Post, CreatePostData, UpdatePostData> & {
  search: (params: SearchParams) => Promise<SearchResponse<Post>>;
  getByAuthor: (authorId: string, params?: PaginationParams) => Promise<PaginatedResponse<Post>>;
  getByTags: (tags: string[], params?: PaginationParams) => Promise<PaginatedResponse<Post>>;
  togglePublished: (id: string) => Promise<Post>;
  addTags: (id: string, tags: string[]) => Promise<Post>;
  removeTags: (id: string, tags: string[]) => Promise<Post>;
  duplicate: (id: string) => Promise<Post>;
  getPopular: (params?: PaginationParams) => Promise<PaginatedResponse<Post>>;
  getRecent: (params?: PaginationParams) => Promise<PaginatedResponse<Post>>;
} = {
  // Standard CRUD operations
  getAll: async (params?: PostFilters): Promise<{ data: PaginatedResponse<Post> }> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.authorId) searchParams.set('authorId', params.authorId);
    if (params?.published !== undefined) searchParams.set('published', params.published.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.tags?.length) searchParams.set('tags', params.tags.join(','));
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const queryString = searchParams.toString();
    const url = queryString ? `posts?${queryString}` : 'posts';

    return apiClient.getRaw<PaginatedResponse<Post>>(url);
  },

  getById: async (id: string | number): Promise<{ data: Post }> => {
    return apiClient.getRaw<Post>(`posts/${id}`);
  },

  create: async (data: CreatePostData): Promise<{ data: Post }> => {
    return apiClient.postRaw<Post>('posts', data);
  },

  update: async (id: string | number, data: UpdatePostData): Promise<{ data: Post }> => {
    return apiClient.patchRaw<Post>(`posts/${id}`, data);
  },

  delete: async (id: string | number): Promise<{ data: void }> => {
    return apiClient.deleteRaw<void>(`posts/${id}`);
  },

  // Extended operations
  search: async (params: SearchParams): Promise<SearchResponse<Post>> => {
    const searchParams = new URLSearchParams({
      query: params.query,
    });

    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      });
    }

    if (params.sort) {
      searchParams.set('sortBy', params.sort.field);
      searchParams.set('sortOrder', params.sort.order);
    }

    return apiClient.get<SearchResponse<Post>>(`posts/search?${searchParams.toString()}`);
  },

  getByAuthor: async (authorId: string, params?: PaginationParams): Promise<PaginatedResponse<Post>> => {
    const searchParams = new URLSearchParams({ authorId });

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    return apiClient.get<PaginatedResponse<Post>>(`posts/author/${authorId}?${searchParams.toString()}`);
  },

  getByTags: async (tags: string[], params?: PaginationParams): Promise<PaginatedResponse<Post>> => {
    const searchParams = new URLSearchParams({
      tags: tags.join(','),
    });

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    return apiClient.get<PaginatedResponse<Post>>(`posts/tags?${searchParams.toString()}`);
  },

  togglePublished: async (id: string): Promise<Post> => {
    return apiClient.patch<Post>(`posts/${id}/toggle-published`);
  },

  addTags: async (id: string, tags: string[]): Promise<Post> => {
    return apiClient.patch<Post>(`posts/${id}/tags`, { tags, action: 'add' });
  },

  removeTags: async (id: string, tags: string[]): Promise<Post> => {
    return apiClient.patch<Post>(`posts/${id}/tags`, { tags, action: 'remove' });
  },

  duplicate: async (id: string): Promise<Post> => {
    return apiClient.post<Post>(`posts/${id}/duplicate`);
  },

  getPopular: async (params?: PaginationParams): Promise<PaginatedResponse<Post>> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const url = queryString ? `posts/popular?${queryString}` : 'posts/popular';

    return apiClient.get<PaginatedResponse<Post>>(url);
  },

  getRecent: async (params?: PaginationParams): Promise<PaginatedResponse<Post>> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const url = queryString ? `posts/recent?${queryString}` : 'posts/recent';

    return apiClient.get<PaginatedResponse<Post>>(url);
  },
};

// Export individual functions for tree-shaking
export const {
  getAll: getAllPosts,
  getById: getPostById,
  create: createPost,
  update: updatePost,
  delete: deletePost,
  search: searchPosts,
  getByAuthor: getPostsByAuthor,
  getByTags: getPostsByTags,
  togglePublished: togglePostPublished,
  addTags: addPostTags,
  removeTags: removePostTags,
  duplicate: duplicatePost,
  getPopular: getPopularPosts,
  getRecent: getRecentPosts,
} = postsApi;
