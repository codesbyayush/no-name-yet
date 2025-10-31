import { useMutation } from '@tanstack/react-query';
import { cn } from '@workspace/ui/lib/utils';
import type React from 'react';
import { toast } from 'sonner';
import { client, queryClient } from '@/utils/orpc';
import { UpvoteIcon } from './upvote-icon';

interface VoteButtonProps {
  count: number;
  feedbackId?: string;
  hasVoted?: boolean;
  disableFromParent?: boolean;
  iconSize?: number;
  className?: string;
}

export const VoteButton: React.FC<VoteButtonProps> = ({
  count,
  feedbackId,
  hasVoted = false,
  disableFromParent = false,
  iconSize = 16,
  className = '',
}) => {
  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!feedbackId) {
      return;
    }

    if (hasVoted) {
      deleteVoteMutation.mutate({ feedbackId });
    } else {
      createVoteMutation.mutate({ feedbackId });
    }
  };

  const createVoteMutation = useMutation({
    mutationFn: ({ feedbackId }: { feedbackId: string }) =>
      client.public.votes.create({ feedbackId }),
    onSuccess: () => {
      toast.success('Vote added!');
      // Invalidate posts to refresh vote counts and vote status
      queryClient.invalidateQueries({ queryKey: ['all-posts'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to vote');
    },
  });

  const deleteVoteMutation = useMutation({
    mutationFn: ({ feedbackId }: { feedbackId: string }) =>
      client.public.votes.delete({ feedbackId }),
    onSuccess: () => {
      toast.success('Vote removed!');
      // Invalidate posts to refresh vote counts and vote status
      queryClient.invalidateQueries({ queryKey: ['all-posts'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove vote');
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
        className,
      )}
      data-filled={hasVoted}
      disabled={disabled}
      onClick={handleVote}
      type='button'
    >
      <UpvoteIcon
        className={cn(
          'transition-all duration-300',
          hasVoted
            ? 'fill-primary stroke-primary'
            : 'fill-transparent stroke-[1.5] stroke-gray-600 dark:stroke-gray-400',
        )}
        filled={hasVoted}
        size={iconSize}
      />
      <p
        className={cn(
          'font-semibold text-sm leading-none transition-all duration-300',
          hasVoted ? 'text-primary' : 'text-gray-600 dark:text-gray-400',
        )}
      >
        {count}
      </p>
    </button>
  );
};
