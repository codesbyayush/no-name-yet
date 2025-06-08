import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { uploadsApi, uploadsKeys } from '../endpoints/uploads';
import type { UploadResponse, UploadOptions, MultipleUploadResponse, UploadProgress } from '../endpoints/uploads';
import { useState, useCallback } from 'react';

// Query hooks
export const useUpload = (id: string, enabled = true) => {
  return useQuery({
    queryKey: uploadsKeys.detail(id),
    queryFn: () => uploadsApi.getUpload(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useUserUploads = (params?: {
  page?: number;
  limit?: number;
  folder?: string;
  type?: string;
}) => {
  return useQuery({
    queryKey: uploadsKeys.list(params),
    queryFn: () => uploadsApi.getUserUploads(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUploadStats = () => {
  return useQuery({
    queryKey: [...uploadsKeys.all, 'stats'],
    queryFn: uploadsApi.getUploadStats,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Mutation hooks
export const useUploadFile = () => {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<UploadProgress | null>(null);

  const mutation = useMutation({
    mutationFn: ({
      file,
      options,
    }: {
      file: File;
      options?: UploadOptions;
    }) => {
      return uploadsApi.uploadFile(file, options, setProgress);
    },
    onSuccess: (uploadResult) => {
      // Add to cache
      queryClient.setQueryData(uploadsKeys.detail(uploadResult.filename), uploadResult);

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: uploadsKeys.lists() });

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: [...uploadsKeys.all, 'stats'] });

      // Reset progress
      setProgress(null);
    },
    onError: (error) => {
      console.error('File upload failed:', error);
      setProgress(null);
    },
  });

  return {
    ...mutation,
    progress,
    uploadProgress: progress?.percentage || 0,
  };
};

export const useUploadFiles = () => {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<UploadProgress[]>([]);

  const mutation = useMutation({
    mutationFn: ({
      files,
      options,
    }: {
      files: File[];
      options?: UploadOptions;
    }) => {
      return uploadsApi.uploadFiles(files, options, setProgress);
    },
    onSuccess: (result: MultipleUploadResponse) => {
      // Add successful uploads to cache
      result.uploads.forEach((upload) => {
        queryClient.setQueryData(uploadsKeys.detail(upload.filename), upload);
      });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: uploadsKeys.lists() });

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: [...uploadsKeys.all, 'stats'] });

      // Reset progress
      setProgress([]);
    },
    onError: (error) => {
      console.error('Files upload failed:', error);
      setProgress([]);
    },
  });

  return {
    ...mutation,
    progress,
    overallProgress: progress.length > 0
      ? Math.round(progress.reduce((sum, p) => sum + p.percentage, 0) / progress.length)
      : 0,
  };
};

export const useUploadFromUrl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ url, options }: { url: string; options?: UploadOptions }) =>
      uploadsApi.uploadFromUrl(url, options),
    onSuccess: (uploadResult) => {
      // Add to cache
      queryClient.setQueryData(uploadsKeys.detail(uploadResult.filename), uploadResult);

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: uploadsKeys.lists() });

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: [...uploadsKeys.all, 'stats'] });
    },
    onError: (error) => {
      console.error('URL upload failed:', error);
    },
  });
};

export const useDeleteUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => uploadsApi.deleteUpload(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: uploadsKeys.detail(id) });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: uploadsKeys.lists() });

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: [...uploadsKeys.all, 'stats'] });
    },
    onError: (error) => {
      console.error('Delete upload failed:', error);
    },
  });
};

export const useUpdateUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        filename?: string;
        isPublic?: boolean;
        folder?: string;
      };
    }) => uploadsApi.updateUpload(id, data),
    onSuccess: (updatedUpload, { id }) => {
      // Update cache
      queryClient.setQueryData(uploadsKeys.detail(id), updatedUpload);

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: uploadsKeys.lists() });
    },
    onError: (error) => {
      console.error('Update upload failed:', error);
    },
  });
};

export const useGenerateThumbnail = () => {
  return useMutation({
    mutationFn: ({
      id,
      options,
    }: {
      id: string;
      options?: {
        width?: number;
        height?: number;
        quality?: number;
      };
    }) => uploadsApi.generateThumbnail(id, options),
    onError: (error) => {
      console.error('Generate thumbnail failed:', error);
    },
  });
};

export const useSignedUploadUrl = () => {
  return useMutation({
    mutationFn: ({
      filename,
      contentType,
      options,
    }: {
      filename: string;
      contentType: string;
      options?: {
        folder?: string;
        expiresIn?: number;
      };
    }) => uploadsApi.getSignedUploadUrl(filename, contentType, options),
    onError: (error) => {
      console.error('Get signed upload URL failed:', error);
    },
  });
};

// Advanced hooks for common patterns
export const useFileUploadWithValidation = (options?: UploadOptions) => {
  const uploadFile = useUploadFile();

  const validateAndUpload = useCallback(
    (file: File) => {
      const validation = uploadsApi.validateFile(file, options);

      if (!validation.isValid) {
        return Promise.reject(new Error(validation.errors.join(', ')));
      }

      return uploadFile.mutateAsync({ file, options });
    },
    [uploadFile, options]
  );

  return {
    ...uploadFile,
    validateAndUpload,
    validate: (file: File) => uploadsApi.validateFile(file, options),
  };
};

export const useDragAndDropUpload = (options?: UploadOptions) => {
  const uploadFiles = useUploadFiles();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);

      if (files.length > 0) {
        // Validate all files first
        const validationResults = files.map(file => ({
          file,
          validation: uploadsApi.validateFile(file, options),
        }));

        const validFiles = validationResults
          .filter(result => result.validation.isValid)
          .map(result => result.file);

        const invalidFiles = validationResults
          .filter(result => !result.validation.isValid);

        if (invalidFiles.length > 0) {
          console.warn('Some files were invalid:', invalidFiles);
        }

        if (validFiles.length > 0) {
          uploadFiles.mutate({ files: validFiles, options });
        }
      }
    },
    [uploadFiles, options]
  );

  return {
    ...uploadFiles,
    isDragOver,
    dragProps: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
};

export const useUploadQueue = () => {
  const [queue, setQueue] = useState<Array<{
    id: string;
    file: File;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    progress: number;
    error?: string;
    result?: UploadResponse;
  }>>([]);

  const uploadFile = useUploadFile();

  const addToQueue = useCallback((files: File | File[]) => {
    const fileArray = Array.isArray(files) ? files : [files];
    const newItems = fileArray.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      status: 'pending' as const,
      progress: 0,
    }));

    setQueue(prev => [...prev, ...newItems]);
    return newItems.map(item => item.id);
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const processQueue = useCallback(async () => {
    const pendingItems = queue.filter(item => item.status === 'pending');

    for (const item of pendingItems) {
      try {
        setQueue(prev =>
          prev.map(queueItem =>
            queueItem.id === item.id
              ? { ...queueItem, status: 'uploading' }
              : queueItem
          )
        );

        const result = await uploadFile.mutateAsync({ file: item.file });

        setQueue(prev =>
          prev.map(queueItem =>
            queueItem.id === item.id
              ? { ...queueItem, status: 'completed', progress: 100, result }
              : queueItem
          )
        );
      } catch (error) {
        setQueue(prev =>
          prev.map(queueItem =>
            queueItem.id === item.id
              ? {
                  ...queueItem,
                  status: 'error',
                  error: error instanceof Error ? error.message : 'Upload failed',
                }
              : queueItem
          )
        );
      }
    }
  }, [queue, uploadFile]);

  return {
    queue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    processQueue,
    isProcessing: queue.some(item => item.status === 'uploading'),
    completedCount: queue.filter(item => item.status === 'completed').length,
    errorCount: queue.filter(item => item.status === 'error').length,
    totalCount: queue.length,
  };
};
