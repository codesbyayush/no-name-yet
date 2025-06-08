# Centralized API System

A modern, type-safe, and highly configurable data fetching system built with **Ky** (modern fetch wrapper) and **TanStack Query** for React applications. This system provides a tRPC/oRPC-like developer experience with full TypeScript safety.

## Features

- 🚀 **Modern HTTP Client**: Built with Ky (lighter and more modern than Axios)
- 🔒 **Full TypeScript Safety**: End-to-end type safety for all API operations
- ⚡ **TanStack Query Integration**: Optimized caching, background updates, and query management
- 🔄 **Automatic Token Management**: Handles authentication tokens automatically
- 📦 **Easy Library Swapping**: Modular design allows easy replacement of HTTP client
- 🎯 **tRPC-like Developer Experience**: Intuitive API with autocomplete and error handling
- 📊 **Progress Tracking**: Built-in upload progress and loading states
- 🛡️ **Error Handling**: Comprehensive error handling with custom error types
- 🔧 **Environment Configuration**: Easy configuration for different environments
- 📁 **File Uploads**: Advanced file upload capabilities with validation and progress

## Installation

The system uses Ky as the HTTP client and integrates with TanStack Query:

```bash
npm install ky
# TanStack Query should already be installed in your project
```

## Quick Start

### 1. Environment Setup

Create your environment variables in `.env`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_TIMEOUT=30000
VITE_API_RETRIES=2

# Development settings
VITE_ENABLE_API_LOGGING=true
VITE_ENABLE_DEVTOOLS=true

# Cache settings (optional)
VITE_DEFAULT_STALE_TIME=300000  # 5 minutes
VITE_AUTH_STALE_TIME=900000     # 15 minutes
VITE_SEARCH_STALE_TIME=30000    # 30 seconds
```

### 2. Basic Usage in React Components

```tsx
import { useAuth, usePosts, useCreatePost } from '@/lib/api';

const MyComponent = () => {
  // Authentication
  const { user, isAuthenticated, login, logout } = useAuth();

  // Data fetching with automatic caching
  const { posts, isLoading, error } = usePosts({ published: true });

  // Mutations with optimistic updates
  const createPost = useCreatePost();

  const handleCreatePost = async () => {
    try {
      await createPost.mutateAsync({
        title: 'My New Post',
        content: 'Content here...',
        published: true,
      });
      // Posts list will automatically update
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      {isLoading ? (
        <div>Loading posts...</div>
      ) : (
        <div>
          {posts?.data.map(post => (
            <div key={post.id}>{post.title}</div>
          ))}
        </div>
      )}
      <button onClick={handleCreatePost}>Create Post</button>
    </div>
  );
};
```

### 3. Direct API Usage (Outside React)

```ts
import { api, login, getAllPosts } from '@/lib/api';

// Direct function calls
const user = await login({ email: 'user@example.com', password: 'password' });
const posts = await getAllPosts({ published: true });

// Or using the API object
const authResult = await api.auth.login({ email: 'user@example.com', password: 'password' });
const postsResult = await api.posts.getAll({ published: true });
```

## API Structure

The API is organized into modules:

### Authentication (`api.auth`)

```ts
// Login/Registration
const { user, login, register, logout } = useAuth();
await api.auth.login({ email, password });
await api.auth.register({ email, password, name });

// Profile management
const updateProfile = useUpdateProfile();
await updateProfile.mutateAsync({ name: 'New Name' });

// Password management
const changePassword = useChangePassword();
await changePassword.mutateAsync({ currentPassword, newPassword });
```

### Posts (`api.posts`)

```ts
// Fetch posts with filters
const { posts } = usePosts({ published: true, authorId: 'user123' });

// Individual post
const { post } = usePost(postId);

// CRUD operations
const createPost = useCreatePost();
const updatePost = useUpdatePost();
const deletePost = useDeletePost();

// Advanced operations
const { posts } = useSearchPosts({ query: 'react', filters: { tags: ['tutorial'] } });
const { posts } = usePostsByAuthor(authorId);
```

### File Uploads (`api.uploads`)

```ts
// Simple upload
const uploadFile = useUploadFile();
await uploadFile.mutateAsync({ 
  file, 
  options: { 
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/*'] 
  } 
});

// Drag & drop with progress
const { dragProps, isDragOver, progress } = useDragAndDropUpload({
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ['image/*'],
});

// Upload queue for multiple files
const { queue, addToQueue, processQueue } = useUploadQueue();
```

## Advanced Features

### Query Keys and Cache Management

```ts
import { queryKeys } from '@/lib/api';

// Access structured query keys
const postsListKey = queryKeys.posts.list({ published: true });
const postDetailKey = queryKeys.posts.detail(postId);

// Manual cache management
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
queryClient.setQueryData(queryKeys.posts.detail(postId), newPostData);
```

### Error Handling

```ts
import { isApiError, getErrorMessage, getErrorStatus } from '@/lib/api';

try {
  await api.posts.create(postData);
} catch (error) {
  if (isApiError(error)) {
    console.log('API Error:', {
      message: error.message,
      status: error.status,
      code: error.code,
    });
    
    // Handle specific errors
    switch (error.status) {
      case 401:
        // Handle unauthorized
        break;
      case 422:
        // Handle validation errors
        break;
    }
  }
}
```

### Optimistic Updates

```ts
const useOptimisticUpdatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => api.posts.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel refetches
      await queryClient.cancelQueries({ queryKey: postsKeys.detail(id) });
      
      // Snapshot previous value
      const previousPost = queryClient.getQueryData(postsKeys.detail(id));
      
      // Optimistically update
      queryClient.setQueryData(postsKeys.detail(id), old => ({ ...old, ...data }));
      
      return { previousPost };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousPost) {
        queryClient.setQueryData(postsKeys.detail(id), context.previousPost);
      }
    },
  });
};
```

### Custom Endpoints

Add new endpoints by creating a new file in `endpoints/`:

```ts
// endpoints/comments.ts
import { apiClient } from '../client';

export const commentsApi = {
  getByPost: (postId: string) => 
    apiClient.get(`posts/${postId}/comments`),
  
  create: (data: CreateCommentData) =>
    apiClient.post('comments', data),
};

// hooks/useComments.ts
export const useComments = (postId: string) => {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => commentsApi.getByPost(postId),
  });
};
```

## Configuration

### HTTP Client Configuration

```ts
// client.ts - Modify the default configuration
const defaultConfig = {
  timeout: 30000,
  retries: 2,
  retry: {
    limit: 2,
    methods: ['GET'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
};
```

### Environment-Specific Settings

The system automatically adapts to different environments:

- **Development**: Detailed logging, devtools enabled
- **Production**: Optimized for performance, minimal logging
- **Testing**: Fast timeouts, no retries

## Migration from Axios

If you're migrating from Axios, the transition is straightforward:

```ts
// Before (Axios)
const response = await axios.get('/api/posts', {
  params: { published: true },
  headers: { Authorization: `Bearer ${token}` }
});

// After (Our API System)
const posts = await api.posts.getAll({ published: true });
// Token is handled automatically
```

## Best Practices

### 1. Use Query Keys Consistently

```ts
// Good
const { data } = useQuery({
  queryKey: postsKeys.list({ authorId }),
  queryFn: () => api.posts.getByAuthor(authorId),
});

// Avoid
const { data } = useQuery({
  queryKey: ['posts', 'by-author', authorId], // Manual key construction
  queryFn: () => api.posts.getByAuthor(authorId),
});
```

### 2. Handle Loading and Error States

```ts
const PostsList = () => {
  const { posts, isLoading, isError, error } = usePosts();

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {posts?.data.map(post => <PostItem key={post.id} post={post} />)}
    </div>
  );
};
```

### 3. Use Mutations with Error Handling

```ts
const CreatePostForm = () => {
  const createPost = useCreatePost();
  
  const handleSubmit = async (formData) => {
    try {
      await createPost.mutateAsync(formData);
      toast.success('Post created successfully!');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={createPost.isPending}>
        {createPost.isPending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
};
```

### 4. Invalidate Queries After Mutations

```ts
const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.posts.create,
    onSuccess: () => {
      // Invalidate and refetch posts list
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
    },
  });
};
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized Errors**
   - Check if auth token is properly set
   - Verify token hasn't expired
   - Check API endpoint authentication requirements

2. **Network Errors**
   - Verify API base URL is correct
   - Check CORS configuration
   - Ensure network connectivity

3. **TypeScript Errors**
   - Update type definitions in `types.ts`
   - Ensure proper type imports
   - Check generic type parameters

### Debug Mode

Enable debug logging in development:

```env
VITE_ENABLE_API_LOGGING=true
```

This will log all API requests and responses to the console.

## Contributing

When adding new endpoints:

1. Add types to `types.ts`
2. Create endpoint functions in `endpoints/`
3. Create React hooks in `hooks/`
4. Export everything from `index.ts`
5. Add examples to `examples.tsx`
6. Update this README

## API Reference

### Core Functions

- `apiClient` - Main HTTP client instance
- `api` - Object containing all API endpoints
- `queryKeys` - Structured query key factories

### Auth Hooks

- `useAuth()` - Complete auth state and actions
- `useLogin()` - Login mutation
- `useRegister()` - Registration mutation
- `useCurrentUser()` - Current user query

### Posts Hooks

- `usePosts(filters?)` - Posts list with filters
- `usePost(id)` - Individual post
- `useCreatePost()` - Create post mutation
- `useUpdatePost()` - Update post mutation
- `useDeletePost()` - Delete post mutation

### Upload Hooks

- `useUploadFile()` - Single file upload
- `useUploadFiles()` - Multiple files upload
- `useDragAndDropUpload()` - Drag & drop interface
- `useUploadQueue()` - Upload queue management

### Utility Functions

- `getErrorMessage(error)` - Extract error message
- `isApiError(error)` - Check if error is API error
- `getErrorStatus(error)` - Get HTTP status from error

## License

This API system is part of your application and follows your project's license.