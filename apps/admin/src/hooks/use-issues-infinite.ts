import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { transformServerPostsToIssues } from '@/lib/server-data-transform';
import { useIssuesStore } from '@/store/issues-store';
import { adminClient } from '@/utils/admin-orpc';
import { client } from '@/utils/orpc';

interface UseIssuesInfiniteOptions {
  boardId?: string;
  enabled?: boolean;
}

export const useIssuesInfinite = ({
  boardId,
  enabled = true,
}: UseIssuesInfiniteOptions = {}) => {
  const { addIssues } = useIssuesStore();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['issues', boardId],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await adminClient.organization.posts.getDetailedPosts({
        offset: (pageParam as number) * 20,
        take: 20,
        boardId,
        sortBy: 'newest',
      });
      return response;
    },
    getNextPageParam: (lastPage: any, allPages) => {
      if (!lastPage.pagination.hasMore) return;
      return allPages.length;
    },
    initialPageParam: 0,
    enabled,
    refetchOnWindowFocus: false,
  });

  // Transform and add server data to Zustand store
  useEffect(() => {
    if (data?.pages) {
      const allPosts = data.pages.flatMap((page) => page.posts);
      const transformedIssues = transformServerPostsToIssues(allPosts);
      addIssues(transformedIssues);
    }
  }, [data, addIssues]);

  // Intersection observer callback
  const lastElementCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (lastElementRef.current) {
        observerRef.current?.unobserve(lastElementRef.current);
      }

      if (node) {
        lastElementRef.current = node;
        observerRef.current = new IntersectionObserver(
          (entries) => {
            if (
              entries[0].isIntersecting &&
              hasNextPage &&
              !isFetchingNextPage
            ) {
              fetchNextPage();
            }
          },
          { threshold: 0.1 }
        );
        observerRef.current.observe(node);
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
    lastElementRef: lastElementCallback,
  };
};
