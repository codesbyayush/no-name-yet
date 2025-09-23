import type { InfiniteData } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type React from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { client, queryClient } from '@/utils/orpc';
import { UpvoteIcon } from './upvote-icon';

interface VoteButtonProps {
  count: number;
  feedbackId?: string;
  hasVoted?: boolean;
  disableFromParent?: boolean;
  iconSize?: number;
  className?: string;
  boardId?: string;
}

export const VoteButton: React.FC<VoteButtonProps> = ({
  count,
  feedbackId,
  hasVoted = false,
  disableFromParent = false,
  className = '',
  boardId,
}) => {
  type PostSummary = {
    id: string;
    hasVoted?: boolean;
    voteCount?: number;
  } & Record<string, unknown>;

  type PostsPage = {
    posts: PostSummary[];
  } & Record<string, unknown>;

  type PostsInfiniteData = InfiniteData<PostsPage>;

  type SinglePost = PostSummary;
  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!feedbackId) {
      return;
    }

    if (hasVoted) {
      deleteVoteMutation.mutate({ fbId: feedbackId });
    } else {
      createVoteMutation.mutate({ fbId: feedbackId });
    }
  };

  const createVoteMutation = useMutation({
    mutationFn: ({ fbId }: { fbId: string }) =>
      client.public.votes.create({ feedbackId: fbId }),
    onMutate: async ({ fbId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['all-posts', boardId],
      });
      await queryClient.cancelQueries({
        queryKey: [fbId, 'post'],
      });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData<PostsInfiniteData>([
        'all-posts',
        boardId,
      ]);
      const previousPost = queryClient.getQueryData<SinglePost>([fbId, 'post']);

      // Optimistically update the posts data
      queryClient.setQueryData<PostsInfiniteData>(
        ['all-posts', boardId],
        (old) => {
          if (!old?.pages) {
            return old;
          }

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post) => {
                if (post.id === fbId) {
                  return {
                    ...post,
                    hasVoted: true,
                    voteCount: (post.voteCount ?? 0) + 1,
                  };
                }
                return post;
              }),
            })),
          };
        }
      );

      // Optimistically update the single post data
      queryClient.setQueryData<SinglePost>([fbId, 'post'], (old) => {
        if (!old) {
          return old;
        }
        return {
          ...old,
          hasVoted: true,
          voteCount: Number(old.voteCount ?? 0) + 1,
        };
      });

      // Return a context object with the snapshotted value
      return { previousPosts, previousPost };
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPosts) {
        queryClient.setQueryData(['all-posts', boardId], context.previousPosts);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(
          [_variables.fbId, 'post'],
          context.previousPost
        );
      }
      toast.error('Failed to vote');
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['all-posts'] });
      if (variables?.fbId) {
        queryClient.invalidateQueries({ queryKey: [variables.fbId, 'post'] });
      }
    },
  });

  const deleteVoteMutation = useMutation({
    mutationFn: ({ fbId }: { fbId: string }) =>
      client.public.votes.delete({ feedbackId: fbId }),
    onMutate: async ({ fbId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['all-posts', boardId],
      });
      await queryClient.cancelQueries({
        queryKey: [fbId, 'post'],
      });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData<PostsInfiniteData>([
        'all-posts',
        boardId,
      ]);
      const previousPost = queryClient.getQueryData<SinglePost>([fbId, 'post']);

      // Optimistically update the posts data
      queryClient.setQueryData<PostsInfiniteData>(
        ['all-posts', boardId],
        (old) => {
          if (!old?.pages) {
            return old;
          }

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post) => {
                if (post.id === fbId) {
                  return {
                    ...post,
                    hasVoted: false,
                    voteCount: Math.max(0, (post.voteCount ?? 0) - 1),
                  };
                }
                return post;
              }),
            })),
          };
        }
      );

      // Optimistically update the single post data
      queryClient.setQueryData<SinglePost>([fbId, 'post'], (old) => {
        if (!old) {
          return old;
        }
        return {
          ...old,
          hasVoted: false,
          voteCount: Math.max(0, (old.voteCount ?? 0) - 1),
        };
      });

      // Return a context object with the snapshotted value
      return { previousPosts, previousPost };
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPosts) {
        queryClient.setQueryData(['all-posts', boardId], context.previousPosts);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(
          [_variables.fbId, 'post'],
          context.previousPost
        );
      }
      toast.error('Failed to remove vote');
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['all-posts'] });
      if (variables?.fbId) {
        queryClient.invalidateQueries({ queryKey: [variables.fbId, 'post'] });
      }
    },
  });

  const disabled =
    createVoteMutation.isPending ||
    deleteVoteMutation.isPending ||
    disableFromParent;

  return (
    <button
      className={cn(
        'group/accessory flex size-12 flex-col items-center justify-center gap-1 rounded-xl border-2 bg-transparent transition-all duration-300',
        hasVoted
          ? 'border-primary hover:border-primary/80'
          : 'border-gray-300 hover:border-primary dark:border-gray-600 dark:hover:border-primary',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      data-filled={hasVoted}
      disabled={disabled}
      onClick={handleVote}
      type="button"
    >
      <UpvoteIcon
        className={cn(
          'transition-all duration-300',
          hasVoted
            ? 'fill-primary stroke-primary'
            : 'fill-transparent stroke-[1.5] stroke-gray-600 dark:stroke-gray-400'
        )}
        filled={hasVoted}
        size={16}
      />
      <p
        className={cn(
          'font-semibold text-sm leading-none transition-all duration-300',
          hasVoted ? 'text-primary' : 'text-gray-600 dark:text-gray-400'
        )}
      >
        {count}
      </p>
    </button>
  );
};
