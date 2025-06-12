import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../../../utils/orpc";
import type { apiRouter } from "../../../../../server/src/orpc/index";

// Query keys for oRPC endpoints
export const orpcKeys = {
  all: ["orpc"] as const,
  health: () => [...orpcKeys.all, "health"] as const,
  currentUser: () => [...orpcKeys.all, "currentUser"] as const,
  echo: (message?: string) => [...orpcKeys.all, "echo", message] as const,
  notes: () => [...orpcKeys.all, "notes"] as const,
};

// Health check hook
export const useHealthCheck = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: orpcKeys.health(),
    queryFn: () => client.healthCheck(),
    enabled: options?.enabled ?? false, // Disabled by default
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
  });
};

// Current user hook
export const useCurrentUser = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: orpcKeys.currentUser(),
    queryFn: () => client.getCurrentUser(),
    enabled: options?.enabled ?? false, // Disabled by default since it requires auth
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.code === "UNAUTHORIZED") {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Echo mutation hook
export const useEcho = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: string) => client.echo({ message }),
    onSuccess: (data, variables) => {
      // Cache the echo result
      queryClient.setQueryData(orpcKeys.echo(variables), data);
    },
    onError: (error) => {
      console.error("Echo failed:", error);
    },
  });
};

// Create private note mutation hook
export const useCreatePrivateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      client.createPrivateNote(data),
    onSuccess: (data) => {
      // Invalidate notes queries
      queryClient.invalidateQueries({ queryKey: orpcKeys.notes() });

      // You could also add the new note to existing cache if you had a notes list
      // queryClient.setQueryData(orpcKeys.notes(), (old: any) => {
      //   return old ? [...old, data] : [data];
      // });
    },
    onError: (error: any) => {
      console.error("Failed to create note:", error);

      // Handle specific errors
      if (error?.code === "UNAUTHORIZED") {
        // Clear user-related queries on auth error
        queryClient.invalidateQueries({ queryKey: orpcKeys.currentUser() });
      }
    },
  });
};

// Utility hook to trigger health check manually
export const useHealthCheckTrigger = () => {
  const queryClient = useQueryClient();

  return () => {
    return queryClient.fetchQuery({
      queryKey: orpcKeys.health(),
      queryFn: () => client.healthCheck(),
    });
  };
};

// Utility hook to trigger current user fetch manually
export const useCurrentUserTrigger = () => {
  const queryClient = useQueryClient();

  return () => {
    return queryClient.fetchQuery({
      queryKey: orpcKeys.currentUser(),
      queryFn: () => client.getCurrentUser(),
    });
  };
};

// Prefetch utilities for performance optimization
export const useOrpcPrefetch = () => {
  const queryClient = useQueryClient();

  return {
    prefetchHealth: () => {
      queryClient.prefetchQuery({
        queryKey: orpcKeys.health(),
        queryFn: () => client.healthCheck(),
        staleTime: 1000 * 60 * 5,
      });
    },
    prefetchCurrentUser: () => {
      queryClient.prefetchQuery({
        queryKey: orpcKeys.currentUser(),
        queryFn: () => client.getCurrentUser(),
        staleTime: 1000 * 60 * 10,
      });
    },
  };
};

// Combined hook for authentication status and user data
export const useAuthStatus = () => {
  const {
    data: userData,
    isLoading,
    error,
    refetch,
  } = useCurrentUser({ enabled: true });

  return {
    user: userData?.user,
    sessionId: userData?.sessionId,
    isAuthenticated: !!userData?.user,
    isLoading,
    error,
    refetch,
  };
};

// Optimistic update hook for better UX
export const useOptimisticEcho = () => {
  const queryClient = useQueryClient();
  const echoMutation = useEcho();

  return useMutation({
    mutationFn: async (message: string) => {
      // Optimistically update the cache
      const optimisticData = {
        echo: message,
        timestamp: new Date().toISOString(),
      };

      queryClient.setQueryData(orpcKeys.echo(message), optimisticData);

      // Perform the actual mutation
      return echoMutation.mutateAsync(message);
    },
    onError: (error, variables) => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: orpcKeys.echo(variables) });
    },
  });
};

// Batch operations hook
export const useOrpcBatch = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: orpcKeys.all });
    },
    refetchAll: () => {
      queryClient.refetchQueries({ queryKey: orpcKeys.all });
    },
    clearAll: () => {
      queryClient.removeQueries({ queryKey: orpcKeys.all });
    },
  };
};

// Error handling utilities
export const isOrpcError = (
  error: unknown,
): error is { code: string; message: string } => {
  return typeof error === "object" && error !== null && "code" in error;
};

export const getOrpcErrorMessage = (error: unknown): string => {
  if (isOrpcError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
};

// Re-export types for convenience
export type HealthCheckResponse = Awaited<
  ReturnType<typeof client.healthCheck>
>;
export type CurrentUserResponse = Awaited<
  ReturnType<typeof client.getCurrentUser>
>;
export type EchoResponse = Awaited<ReturnType<typeof client.echo>>;
export type CreatePrivateNoteResponse = Awaited<
  ReturnType<typeof client.createPrivateNote>
>;
