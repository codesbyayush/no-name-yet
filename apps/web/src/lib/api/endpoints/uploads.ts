import { apiClient } from '../client';
import type { UploadResponse, QueryKeyFactory } from '../types';

// Upload query keys factory
export const uploadsKeys: QueryKeyFactory = {
  all: ['uploads'] as const,
  lists: () => [...uploadsKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...uploadsKeys.lists(), filters] as const,
  details: () => [...uploadsKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...uploadsKeys.details(), id] as const,
};

// Upload-specific types
export interface UploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  folder?: string;
  isPublic?: boolean;
  filename?: string;
}

export interface MultipleUploadResponse {
  uploads: UploadResponse[];
  failed: Array<{
    filename: string;
    error: string;
  }>;
}

export interface UploadProgress {
  filename: string;
  loaded: number;
  total: number;
  percentage: number;
}

// Uploads API endpoints
export const uploadsApi = {
  // Single file upload
  uploadFile: async (
    file: File,
    options?: UploadOptions,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    if (options?.folder) {
      formData.append('folder', options.folder);
    }
    if (options?.isPublic !== undefined) {
      formData.append('isPublic', options.isPublic.toString());
    }
    if (options?.filename) {
      formData.append('filename', options.filename);
    }
    if (options?.maxSize) {
      formData.append('maxSize', options.maxSize.toString());
    }
    if (options?.allowedTypes?.length) {
      formData.append('allowedTypes', options.allowedTypes.join(','));
    }

    // Create XMLHttpRequest for progress tracking
    if (onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress: UploadProgress = {
              filename: file.name,
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
            };
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response.data);
            } catch (error) {
              reject(new Error('Invalid response format'));
            }
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', `${apiClient['httpClient']['prefixUrl']}/uploads`);

        // Add auth header if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.send(formData);
      });
    }

    // Fallback to regular upload without progress
    return apiClient.upload<UploadResponse>('uploads', formData);
  },

  // Multiple files upload
  uploadFiles: async (
    files: File[],
    options?: UploadOptions,
    onProgress?: (progress: UploadProgress[]) => void
  ): Promise<MultipleUploadResponse> => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('files', file);
    });

    if (options?.folder) {
      formData.append('folder', options.folder);
    }
    if (options?.isPublic !== undefined) {
      formData.append('isPublic', options.isPublic.toString());
    }
    if (options?.maxSize) {
      formData.append('maxSize', options.maxSize.toString());
    }
    if (options?.allowedTypes?.length) {
      formData.append('allowedTypes', options.allowedTypes.join(','));
    }

    if (onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            // Approximate progress for multiple files
            const overallProgress = files.map((file, index) => ({
              filename: file.name,
              loaded: Math.round((event.loaded / files.length) * (index + 1)),
              total: file.size,
              percentage: Math.round((event.loaded / event.total) * 100),
            }));
            onProgress(overallProgress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response.data);
            } catch (error) {
              reject(new Error('Invalid response format'));
            }
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', `${apiClient['httpClient']['prefixUrl']}/uploads/multiple`);

        // Add auth header if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.send(formData);
      });
    }

    return apiClient.upload<MultipleUploadResponse>('uploads/multiple', formData);
  },

  // Upload from URL
  uploadFromUrl: async (url: string, options?: UploadOptions): Promise<UploadResponse> => {
    return apiClient.post<UploadResponse>('uploads/from-url', {
      url,
      ...options,
    });
  },

  // Get upload by ID
  getUpload: async (id: string): Promise<UploadResponse> => {
    return apiClient.get<UploadResponse>(`uploads/${id}`);
  },

  // Get user's uploads
  getUserUploads: async (params?: {
    page?: number;
    limit?: number;
    folder?: string;
    type?: string;
  }): Promise<{
    uploads: UploadResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.folder) searchParams.set('folder', params.folder);
    if (params?.type) searchParams.set('type', params.type);

    const queryString = searchParams.toString();
    const url = queryString ? `uploads/user?${queryString}` : 'uploads/user';

    return apiClient.get(url);
  },

  // Delete upload
  deleteUpload: async (id: string): Promise<void> => {
    return apiClient.delete(`uploads/${id}`);
  },

  // Generate signed URL for direct upload (useful for large files)
  getSignedUploadUrl: async (filename: string, contentType: string, options?: {
    folder?: string;
    expiresIn?: number; // seconds
  }): Promise<{
    uploadUrl: string;
    fileUrl: string;
    fields: Record<string, string>;
  }> => {
    return apiClient.post('uploads/signed-url', {
      filename,
      contentType,
      ...options,
    });
  },

  // Get upload statistics
  getUploadStats: async (): Promise<{
    totalUploads: number;
    totalSize: number;
    quotaUsed: number;
    quotaLimit: number;
    fileTypes: Array<{
      type: string;
      count: number;
      size: number;
    }>;
  }> => {
    return apiClient.get('uploads/stats');
  },

  // Update upload metadata
  updateUpload: async (id: string, data: {
    filename?: string;
    isPublic?: boolean;
    folder?: string;
  }): Promise<UploadResponse> => {
    return apiClient.patch<UploadResponse>(`uploads/${id}`, data);
  },

  // Generate thumbnail (for images)
  generateThumbnail: async (id: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
  }): Promise<{
    thumbnailUrl: string;
  }> => {
    return apiClient.post(`uploads/${id}/thumbnail`, options);
  },

  // Validate file before upload
  validateFile: (file: File, options?: UploadOptions): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    // Check file size
    if (options?.maxSize && file.size > options.maxSize) {
      errors.push(`File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (${Math.round(options.maxSize / 1024 / 1024)}MB)`);
    }

    // Check file type
    if (options?.allowedTypes?.length) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type.toLowerCase();

      const isValidType = options.allowedTypes.some(type => {
        return type.toLowerCase() === fileExtension ||
               type.toLowerCase() === mimeType ||
               mimeType.startsWith(type.toLowerCase().replace('*', ''));
      });

      if (!isValidType) {
        errors.push(`File type not allowed. Allowed types: ${options.allowedTypes.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

// Export individual functions for tree-shaking
export const {
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
} = uploadsApi;
