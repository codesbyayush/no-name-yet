// API System Setup and Integration Guide
// This file shows how to integrate the centralized API system with your app

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { config } from './config';

// 1. Query Client Configuration
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default stale time from config
        staleTime: config.cache.defaultStaleTime,
        // Retry configuration
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          // Retry up to 2 times for other errors
          return failureCount < 2;
        },
        // Refetch on window focus in production
        refetchOnWindowFocus: config.enableDevtools ? false : 'always',
        // Network mode
        networkMode: 'online',
      },
      mutations: {
        // Default mutation options
        retry: 1,
        networkMode: 'online',
      },
    },
  });
};

// 2. API Provider Component
interface ApiProviderProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({
  children,
  queryClient = createQueryClient()
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {config.enableDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

// 3. App Root Setup Example
export const AppWithApiSetup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Create query client instance
  const queryClient = React.useMemo(() => createQueryClient(), []);

  // Handle auth state changes
  React.useEffect(() => {
    const handleAuthChange = () => {
      // Clear all queries when user logs out
      queryClient.clear();
    };

    const handleAuthError = () => {
      // Clear auth-related queries on auth error
      queryClient.removeQueries({ queryKey: ['auth'] });
    };

    // Listen for auth events
    window.addEventListener('auth:logout', handleAuthChange);
    window.addEventListener('auth:unauthorized', handleAuthError);
    window.addEventListener('auth:token-expired', handleAuthChange);

    return () => {
      window.removeEventListener('auth:logout', handleAuthChange);
      window.removeEventListener('auth:unauthorized', handleAuthError);
      window.removeEventListener('auth:token-expired', handleAuthChange);
    };
  }, [queryClient]);

  return (
    <ApiProvider queryClient={queryClient}>
      {children}
    </ApiProvider>
  );
};

// 4. Integration with your main.tsx
/*
Update your main.tsx file like this:

import { RouterProvider, createRouter } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { AppWithApiSetup } from "./lib/api/setup";
import Loader from "./components/loader";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingComponent: () => <Loader />,
  context: {},
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <AppWithApiSetup>
      <RouterProvider router={router} />
    </AppWithApiSetup>
  );
}
*/

// 5. Environment Variables Setup
/*
Add these to your .env file:

# Required - API Base URL
VITE_API_BASE_URL=http://localhost:3001/api

# Optional - API Configuration
VITE_API_TIMEOUT=30000
VITE_API_RETRIES=2

# Optional - Development Settings
VITE_ENABLE_API_LOGGING=true
VITE_ENABLE_DEVTOOLS=true

# Optional - Cache Configuration
VITE_DEFAULT_STALE_TIME=300000
VITE_AUTH_STALE_TIME=900000
VITE_SEARCH_STALE_TIME=30000

# Optional - Auth Configuration
VITE_AUTH_TOKEN_KEY=auth_token
VITE_REFRESH_TOKEN_KEY=refresh_token
VITE_TOKEN_PREFIX=Bearer
*/

// 6. Usage Examples in Components
export const UsageExamples = () => {
  return (
    <div>
      <h2>How to Use the API System in Your Components</h2>

      <h3>Example 1: Simple Data Fetching</h3>
      <pre>{`
import { usePosts, useAuth } from '@/lib/api';

const PostsList = () => {
  const { posts, isLoading, error } = usePosts({ published: true });
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <LoginForm />;
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      {posts?.data.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
};
      `}</pre>

      <h3>Example 2: Creating Data with Mutations</h3>
      <pre>{`
import { useCreatePost, getErrorMessage } from '@/lib/api';

const CreatePostForm = () => {
  const createPost = useCreatePost();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    published: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPost.mutateAsync(formData);
      setFormData({ title: '', content: '', published: false });
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.title}
        onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
        placeholder="Post title"
      />
      <textarea
        value={formData.content}
        onChange={(e) => setFormData(prev => ({...prev, content: e.target.value}))}
        placeholder="Post content"
      />
      <button disabled={createPost.isPending}>
        {createPost.isPending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
};
      `}</pre>

      <h3>Example 3: File Upload with Progress</h3>
      <pre>{`
import { useUploadFile } from '@/lib/api';

const FileUploader = () => {
  const { mutate: uploadFile, isPending, progress } = useUploadFile();

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile({
        file,
        options: {
          maxSize: 10 * 1024 * 1024, // 10MB
          allowedTypes: ['image/*']
        }
      });
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileSelect} disabled={isPending} />
      {isPending && (
        <div>
          <p>Uploading: {progress?.percentage || 0}%</p>
          <progress value={progress?.percentage || 0} max={100} />
        </div>
      )}
    </div>
  );
};
      `}</pre>

      <h3>Example 4: Direct API Usage (Non-React)</h3>
      <pre>{`
import { api, isApiError } from '@/lib/api';

// In a server action, utility function, or non-React context
export const fetchUserPosts = async (userId: string) => {
  try {
    const result = await api.posts.getByAuthor(userId, { limit: 10 });
    return result.data;
  } catch (error) {
    if (isApiError(error)) {
      console.error('API Error:', error.message, 'Status:', error.status);
    }
    throw error;
  }
};

// In an event handler
export const handleBulkUpload = async (files: File[]) => {
  try {
    const result = await api.uploads.uploadFiles(files, {
      folder: 'bulk-uploads',
      maxSize: 5 * 1024 * 1024
    });
    return result.uploads;
  } catch (error) {
    console.error('Bulk upload failed:', error);
    throw error;
  }
};
      `}</pre>
    </div>
  );
};

// 7. Migration Guide for Existing Code
export const MigrationGuide = () => {
  return (
    <div>
      <h2>Migration Guide</h2>

      <h3>From Fetch/Axios to Our API System</h3>
      <pre>{`
// Before (Fetch/Axios)
const fetchPosts = async () => {
  try {
    const response = await fetch('/api/posts?published=true', {
      headers: {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// After (Our API System)
import { usePosts } from '@/lib/api';

const { posts, isLoading, error } = usePosts({ published: true });
// Token handling, error handling, caching, and loading states are automatic
      `}</pre>

      <h3>From Manual State Management to React Query</h3>
      <pre>{`
// Before (Manual state management)
const [posts, setPosts] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await api.getPosts();
      setPosts(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  fetchPosts();
}, []);

// After (React Query with our API)
const { posts, isLoading, error } = usePosts();
// Automatic background refetching, caching, and synchronization
      `}</pre>
    </div>
  );
};

// 8. Performance Tips
export const PerformanceTips = () => {
  return (
    <div>
      <h2>Performance Optimization Tips</h2>

      <ul>
        <li><strong>Use appropriate stale times:</strong> Set longer stale times for data that doesn't change often</li>
        <li><strong>Prefetch data:</strong> Use prefetchQuery for data you know users will need</li>
        <li><strong>Optimize query keys:</strong> Use structured query keys for better cache management</li>
        <li><strong>Enable optimistic updates:</strong> For better user experience during mutations</li>
        <li><strong>Use infinite queries:</strong> For paginated data that users scroll through</li>
        <li><strong>Debounce search queries:</strong> Prevent excessive API calls during typing</li>
      </ul>

      <h3>Example: Prefetching Data</h3>
      <pre>{`
import { useQueryClient } from '@tanstack/react-query';
import { postsKeys, api } from '@/lib/api';

const PostsPage = () => {
  const queryClient = useQueryClient();

  // Prefetch popular posts when user hovers over link
  const handlePrefetchPopular = () => {
    queryClient.prefetchQuery({
      queryKey: postsKeys.list({ type: 'popular' }),
      queryFn: () => api.posts.getPopular(),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  return (
    <div>
      <a
        href="/popular"
        onMouseEnter={handlePrefetchPopular}
      >
        Popular Posts
      </a>
    </div>
  );
};
      `}</pre>
    </div>
  );
};

// Export everything for easy access
export default {
  createQueryClient,
  ApiProvider,
  AppWithApiSetup,
  UsageExamples,
  MigrationGuide,
  PerformanceTips,
};
