// Comprehensive examples of how to use the centralized API system
// This file demonstrates tRPC/oRPC-like usage with full TypeScript safety

import React, { useState } from 'react';
import {
  // Direct API functions (for use outside React or in server functions)
  api,
  login,
  getAllPosts,
  uploadFile,

  // React hooks for components
  useAuth,
  useLogin,
  useRegister,
  usePosts,
  usePost,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
  useUploadFile,
  useDragAndDropUpload,
  useFileUploadWithValidation,

  // Types
  type LoginCredentials,
  type CreatePostData,
  type UploadOptions,

  // Utilities
  getErrorMessage,
  isApiError,
} from './index';

// Example 1: Authentication Component
export const AuthExample: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const loginMutation = useLogin();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const handleLogin = async () => {
    try {
      await loginMutation.mutateAsync(credentials);
      // User is now logged in, auth state will update automatically
    } catch (error) {
      console.error('Login failed:', getErrorMessage(error));
    }
  };

  if (isLoading) return <div>Loading auth state...</div>;

  if (isAuthenticated) {
    return (
      <div>
        <h2>Welcome, {user?.name}!</h2>
        <p>Email: {user?.email}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Login</h2>
      <input
        type="email"
        value={credentials.email}
        onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
        placeholder="Email"
      />
      <input
        type="password"
        value={credentials.password}
        onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
        placeholder="Password"
      />
      <button
        onClick={handleLogin}
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </button>
      {loginMutation.error && (
        <p style={{ color: 'red' }}>
          Error: {getErrorMessage(loginMutation.error)}
        </p>
      )}
    </div>
  );
};

// Example 2: Posts List with CRUD Operations
export const PostsExample: React.FC = () => {
  const [filters, setFilters] = useState({ published: true });
  const { posts, isLoading, error, refetch } = usePosts(filters);
  const createPostMutation = useCreatePost();
  const [newPost, setNewPost] = useState<CreatePostData>({
    title: '',
    content: '',
    published: false,
  });

  const handleCreatePost = async () => {
    try {
      await createPostMutation.mutateAsync(newPost);
      setNewPost({ title: '', content: '', published: false });
      // Posts list will update automatically due to cache invalidation
    } catch (error) {
      console.error('Create post failed:', getErrorMessage(error));
    }
  };

  if (isLoading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {getErrorMessage(error)}</div>;

  return (
    <div>
      <h2>Posts</h2>

      {/* Filter controls */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={filters.published}
            onChange={(e) => setFilters({ published: e.target.checked })}
          />
          Show only published posts
        </label>
        <button onClick={() => refetch()}>Refresh</button>
      </div>

      {/* Create new post */}
      <div style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
        <h3>Create New Post</h3>
        <input
          type="text"
          value={newPost.title}
          onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Post title"
        />
        <textarea
          value={newPost.content}
          onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Post content"
        />
        <label>
          <input
            type="checkbox"
            checked={newPost.published}
            onChange={(e) => setNewPost(prev => ({ ...prev, published: e.target.checked }))}
          />
          Published
        </label>
        <button
          onClick={handleCreatePost}
          disabled={createPostMutation.isPending}
        >
          {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
        </button>
      </div>

      {/* Posts list */}
      <div>
        {posts?.data.map((post) => (
          <PostItem key={post.id} postId={post.id} />
        ))}
      </div>

      {/* Pagination */}
      {posts?.pagination && (
        <div>
          <p>
            Page {posts.pagination.page} of {posts.pagination.totalPages}
            ({posts.pagination.total} total posts)
          </p>
        </div>
      )}
    </div>
  );
};

// Example 3: Individual Post Component with Actions
const PostItem: React.FC<{ postId: string }> = ({ postId }) => {
  const { post, isLoading, actions, mutations } = usePostState(postId);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', content: '' });

  React.useEffect(() => {
    if (post) {
      setEditData({ title: post.title, content: post.content });
    }
  }, [post]);

  const handleSave = async () => {
    try {
      await actions.update(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed:', getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await actions.delete();
      } catch (error) {
        console.error('Delete failed:', getErrorMessage(error));
      }
    }
  };

  if (isLoading) return <div>Loading post...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div style={{ border: '1px solid #ddd', padding: '1rem', margin: '0.5rem 0' }}>
      {isEditing ? (
        <div>
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
          />
          <textarea
            value={editData.content}
            onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
          />
          <button onClick={handleSave} disabled={mutations.updatePost.isPending}>
            {mutations.updatePost.isPending ? 'Saving...' : 'Save'}
          </button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <p>
            <strong>Status:</strong> {post.published ? 'Published' : 'Draft'}
          </p>
          <p>
            <strong>Tags:</strong> {post.tags.join(', ') || 'None'}
          </p>
          <div>
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button
              onClick={() => actions.togglePublished()}
              disabled={mutations.togglePublished.isPending}
            >
              {post.published ? 'Unpublish' : 'Publish'}
            </button>
            <button
              onClick={() => actions.duplicate()}
              disabled={mutations.duplicate.isPending}
            >
              Duplicate
            </button>
            <button
              onClick={handleDelete}
              disabled={mutations.deletePost.isPending}
              style={{ color: 'red' }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Example 4: File Upload with Progress and Validation
export const FileUploadExample: React.FC = () => {
  const uploadOptions: UploadOptions = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/*', 'application/pdf'],
    folder: 'user-uploads',
    isPublic: true,
  };

  const {
    mutate: uploadFile,
    isPending,
    progress,
    uploadProgress,
    validate
  } = useFileUploadWithValidation(uploadOptions);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate before upload
    const validation = validate(file);
    if (!validation.isValid) {
      alert(`Invalid file: ${validation.errors.join(', ')}`);
      return;
    }

    uploadFile({ file });
  };

  return (
    <div>
      <h2>File Upload Example</h2>
      <input
        type="file"
        onChange={handleFileSelect}
        disabled={isPending}
        accept="image/*,application/pdf"
      />

      {isPending && (
        <div>
          <p>Uploading: {uploadProgress}%</p>
          <div style={{
            width: '100%',
            height: '20px',
            backgroundColor: '#f0f0f0',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div
              style={{
                width: `${uploadProgress}%`,
                height: '100%',
                backgroundColor: '#4CAF50',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Example 5: Drag and Drop Upload
export const DragDropUploadExample: React.FC = () => {
  const uploadOptions: UploadOptions = {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/*'],
    folder: 'gallery',
  };

  const {
    mutate: uploadFiles,
    isPending,
    progress,
    overallProgress,
    isDragOver,
    dragProps
  } = useDragAndDropUpload(uploadOptions);

  return (
    <div>
      <h2>Drag & Drop Upload</h2>
      <div
        {...dragProps}
        style={{
          border: `2px dashed ${isDragOver ? '#4CAF50' : '#ccc'}`,
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: isDragOver ? '#f0f8ff' : '#fafafa',
          transition: 'all 0.3s ease',
        }}
      >
        {isPending ? (
          <div>
            <p>Uploading files... {overallProgress}%</p>
            {progress.map((p, index) => (
              <div key={index} style={{ margin: '0.5rem 0' }}>
                <span>{p.filename}: {p.percentage}%</span>
              </div>
            ))}
          </div>
        ) : (
          <p>
            {isDragOver ? 'Drop files here!' : 'Drag and drop images here, or click to select'}
          </p>
        )}
      </div>
    </div>
  );
};

// Example 6: Using API functions directly (without React hooks)
export const directApiUsage = async () => {
  try {
    // Direct API calls - useful for server-side or non-React contexts

    // Login
    const authResult = await api.auth.login({
      email: 'user@example.com',
      password: 'password123',
    });
    console.log('Logged in user:', authResult.user);

    // Get posts
    const postsResult = await api.posts.getAll({ published: true, limit: 10 });
    console.log('Posts:', postsResult.data);

    // Create a post
    const newPost = await api.posts.create({
      title: 'My New Post',
      content: 'This is the content of my new post.',
      published: true,
    });
    console.log('Created post:', newPost.data);

    // Upload a file (assuming you have a File object)
    // const file = new File(['content'], 'example.txt', { type: 'text/plain' });
    // const uploadResult = await api.uploads.uploadFile(file);
    // console.log('Uploaded file:', uploadResult);

  } catch (error) {
    if (isApiError(error)) {
      console.error('API Error:', {
        message: error.message,
        status: error.status,
        code: error.code,
      });
    } else {
      console.error('Unknown error:', error);
    }
  }
};

// Example 7: Error Handling Component
export const ErrorHandlingExample: React.FC = () => {
  const { posts, error, isError } = usePosts();
  const createPost = useCreatePost();

  const handleCreateWithErrorHandling = async () => {
    try {
      await createPost.mutateAsync({
        title: 'Test Post',
        content: 'Test content',
        published: true,
      });
    } catch (error) {
      // Handle specific error types
      if (isApiError(error)) {
        switch (error.status) {
          case 401:
            alert('Please log in to create posts');
            break;
          case 403:
            alert('You do not have permission to create posts');
            break;
          case 422:
            alert('Please check your input data');
            break;
          default:
            alert(`Error: ${error.message}`);
        }
      } else {
        alert('An unexpected error occurred');
      }
    }
  };

  return (
    <div>
      <h2>Error Handling Example</h2>

      {/* Query error handling */}
      {isError && (
        <div style={{ color: 'red', padding: '1rem', border: '1px solid red' }}>
          <h3>Failed to load posts</h3>
          <p>{getErrorMessage(error)}</p>
        </div>
      )}

      {/* Mutation error handling */}
      <button onClick={handleCreateWithErrorHandling}>
        Create Post with Error Handling
      </button>

      {createPost.error && (
        <div style={{ color: 'red' }}>
          Create Error: {getErrorMessage(createPost.error)}
        </div>
      )}
    </div>
  );
};

// Example 8: Complete application component using the API
export const CompleteExample: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthExample />;
  }

  return (
    <div>
      <h1>My App</h1>
      <PostsExample />
      <FileUploadExample />
      <DragDropUploadExample />
      <ErrorHandlingExample />
    </div>
  );
};

// Export all examples
export default {
  AuthExample,
  PostsExample,
  FileUploadExample,
  DragDropUploadExample,
  ErrorHandlingExample,
  CompleteExample,
  directApiUsage,
};
