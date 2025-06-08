import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { postsApi, postsKeys } from '../endpoints/posts';
import type {
  Post,
  CreatePostData,
  UpdatePostData,
  PostFilters,
  PaginationParams,
  SearchParams
} from '../types';

// Query hooks
export const usePosts = (filters?: PostFilters) => {
  return useQuery({
    queryKey: postsKeys.list(filters),
    queryFn: () => postsApi.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => data.data, // Extract data from ApiResponse wrapper
  });
};

export const useInfinitePosts = (filters?: PostFilters) => {
  return useInfiniteQuery({
    queryKey: [...postsKeys.list(filters), 'infinite'],
    queryFn: ({ pageParam = 1 }) =>
      postsApi.getAll({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage.data;
      return pagination.hasNext ? pagination.page + 1 : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => ({
      pages: data.pages.map(page => page.data),
      pageParams: data.pageParams,
    }),
  });
};

export const usePost = (id: string | number, enabled = true) => {
  return useQuery({
    queryKey: postsKeys.detail(id),
    queryFn: () => postsApi.getById(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => data.data, // Extract data from ApiResponse wrapper
  });
};

export const useSearchPosts = (searchParams: SearchParams, enabled = true) => {
  return useQuery({
    queryKey: [...postsKeys.all, 'search', searchParams],
    queryFn: () => postsApi.search(searchParams),
    enabled: enabled && !!searchParams.query,
    staleTime: 1000 * 30, // 30 seconds for search results
  });
};

export const usePostsByAuthor = (authorId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: [...postsKeys.all, 'author', authorId, params],
    queryFn: () => postsApi.getByAuthor(authorId, params),
    enabled: !!authorId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePostsByTags = (tags: string[], params?: PaginationParams) => {
  return useQuery({
    queryKey: [...postsKeys.all, 'tags', tags, params],
    queryFn: () => postsApi.getByTags(tags, params),
    enabled: tags.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePopularPosts = (params?: PaginationParams) => {
  return useQuery({
    queryKey: [...postsKeys.all, 'popular', params],
    queryFn: () => postsApi.getPopular(params),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

export const useRecentPosts = (params?: PaginationParams) => {
  return useQuery({
    queryKey: [...postsKeys.all, 'recent', params],
    queryFn: () => postsApi.getRecent(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Mutation hooks
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostData) => postsApi.create(data),
    onSuccess: (response) => {
      const newPost = response.data;

      // Invalidate posts lists
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });

      // Add the new post to relevant caches
      queryClient.setQueryData(postsKeys.detail(newPost.id), { data: newPost });

      // Update author's posts if cached
      queryClient.invalidateQueries({
        queryKey: [...postsKeys.all, 'author', newPost.authorId]
      });
    },
    onError: (error) => {
      console.error('Create post failed:', error);
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdatePostData }) =>
      postsApi.update(id, data),
    onSuccess: (response, variables) => {
      const updatedPost = response.data;
      const { id } = variables;

      // Update the specific post cache
      queryClient.setQueryData(postsKeys.detail(id), { data: updatedPost });

      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });

      // Update author's posts if cached
      queryClient.invalidateQueries({
        queryKey: [...postsKeys.all, 'author', updatedPost.authorId]
      });
    },
    onError: (error) => {
      console.error('Update post failed:', error);
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => postsApi.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: postsKeys.detail(id) });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });

      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: postsKeys.all });
    },
    onError: (error) => {
      console.error('Delete post failed:', error);
    },
  });
};

export const useTogglePostPublished = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postsApi.togglePublished(id),
    onSuccess: (updatedPost) => {
      // Update the specific post cache
      queryClient.setQueryData(postsKeys.detail(updatedPost.id), { data: updatedPost });

      // Invalidate lists to reflect publication status change
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
    },
    onError: (error) => {
      console.error('Toggle post published failed:', error);
    },
  });
};

export const useAddPostTags = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tags }: { id: string; tags: string[] }) =>
      postsApi.addTags(id, tags),
    onSuccess: (updatedPost) => {
      // Update the specific post cache
      queryClient.setQueryData(postsKeys.detail(updatedPost.id), { data: updatedPost });

      // Invalidate tag-related queries
      queryClient.invalidateQueries({ queryKey: [...postsKeys.all, 'tags'] });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
    },
    onError: (error) => {
      console.error('Add post tags failed:', error);
    },
  });
};

export const useRemovePostTags = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tags }: { id: string; tags: string[] }) =>
      postsApi.removeTags(id, tags),
    onSuccess: (updatedPost) => {
      // Update the specific post cache
      queryClient.setQueryData(postsKeys.detail(updatedPost.id), { data: updatedPost });

      // Invalidate tag-related queries
      queryClient.invalidateQueries({ queryKey: [...postsKeys.all, 'tags'] });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
    },
    onError: (error) => {
      console.error('Remove post tags failed:', error);
    },
  });
};

export const useDuplicatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postsApi.duplicate(id),
    onSuccess: (duplicatedPost) => {
      // Add the duplicated post to cache
      queryClient.setQueryData(postsKeys.detail(duplicatedPost.id), { data: duplicatedPost });

      // Invalidate lists to show the new post
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });

      // Update author's posts if cached
      queryClient.invalidateQueries({
        queryKey: [...postsKeys.all, 'author', duplicatedPost.authorId]
      });
    },
    onError: (error) => {
      console.error('Duplicate post failed:', error);
    },
  });
};

// Optimistic update mutations
export const useOptimisticUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdatePostData }) =>
      postsApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: postsKeys.detail(id) });

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData(postsKeys.detail(id));

      // Optimistically update to the new value
      if (previousPost) {
        queryClient.setQueryData(postsKeys.detail(id), {
          data: { ...(previousPost as any).data, ...data },
        });
      }

      // Return a context object with the snapshotted value
      return { previousPost };
    },
    onError: (err, { id }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPost) {
        queryClient.setQueryData(postsKeys.detail(id), context.previousPost);
      }
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: postsKeys.detail(id) });
    },
  });
};

// Composite hooks for common patterns
export const usePostsWithActions = (filters?: PostFilters) => {
  const posts = usePosts(filters);
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();
  const togglePublished = useTogglePostPublished();

  return {
    posts: posts.data,
    isLoading: posts.isLoading,
    isError: posts.isError,
    error: posts.error,
    refetch: posts.refetch,
    createPost,
    updatePost,
    deletePost,
    togglePublished,
  };
};

// Helper hook for managing post state
export const usePostState = (id: string | number) => {
  const post = usePost(id);
  const updatePost = useOptimisticUpdatePost();
  const deletePost = useDeletePost();
  const togglePublished = useTogglePostPublished();
  const addTags = useAddPostTags();
  const removeTags = useRemovePostTags();
  const duplicate = useDuplicatePost();

  return {
    post: post.data,
    isLoading: post.isLoading,
    isError: post.isError,
    error: post.error,
    refetch: post.refetch,
    actions: {
      update: (data: UpdatePostData) => updatePost.mutate({ id, data }),
      delete: () => deletePost.mutate(id),
      togglePublished: () => togglePublished.mutate(id.toString()),
      addTags: (tags: string[]) => addTags.mutate({ id: id.toString(), tags }),
      removeTags: (tags: string[]) => removeTags.mutate({ id: id.toString(), tags }),
      duplicate: () => duplicate.mutate(id.toString()),
    },
    mutations: {
      updatePost,
      deletePost,
      togglePublished,
      addTags,
      removeTags,
      duplicate,
    },
  };
};
