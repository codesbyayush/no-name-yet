import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';
import { cn } from '@workspace/ui/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Send } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';
import { client, queryClient } from '@/utils/orpc';

interface RequestCommentsProps {
  requestId: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date | string;
  author: {
    name: string | null;
    image: string | null;
  } | null;
}

export function RequestComments({ requestId }: RequestCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const { session } = useAuth();

  // Fetch comments
  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', requestId],
    queryFn: async () => {
      const result = await client.public.comments.getAll({
        feedbackId: requestId,
      });
      return result as Comment[];
    },
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await client.public.comments.create({
        feedbackId: requestId,
        content,
      });
    },
    onSuccess: () => {
      setNewComment('');
      toast.success('Comment added');
      queryClient.invalidateQueries({ queryKey: ['comments', requestId] });
      queryClient.invalidateQueries({ queryKey: ['comment-count', requestId] });
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createCommentMutation.mutate(newComment.trim());
  };

  const currentUserName = session?.user?.name || 'You';
  const currentUserImage = session?.user?.image || undefined;
  const currentUserInitials = currentUserName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className='space-y-6'>
      {/* Section Header */}
      <div className='flex items-center gap-2'>
        <MessageSquare className='size-4 text-muted-foreground' />
        <h3 className='font-semibold text-sm'>
          Comments{' '}
          {comments && comments.length > 0 && (
            <span className='font-normal text-muted-foreground'>
              ({comments.length})
            </span>
          )}
        </h3>
      </div>

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className='flex gap-3'>
        <Avatar className='size-8 shrink-0'>
          <AvatarImage alt={currentUserName} src={currentUserImage} />
          <AvatarFallback className='text-xs'>
            {currentUserInitials}
          </AvatarFallback>
        </Avatar>
        <div className='flex flex-1 flex-col gap-2'>
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder='Add a comment...'
            className='min-h-[80px] resize-none'
            disabled={createCommentMutation.isPending}
          />
          <div className='flex justify-end'>
            <Button
              type='submit'
              size='sm'
              disabled={!newComment.trim() || createCommentMutation.isPending}
            >
              <Send className='mr-1.5 size-3.5' />
              {createCommentMutation.isPending ? 'Sending...' : 'Comment'}
            </Button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className='space-y-0'>
        {isLoading ? (
          <CommentsSkeleton />
        ) : !comments || comments.length === 0 ? (
          <EmptyComments />
        ) : (
          <AnimatePresence mode='popLayout'>
            {comments.map((comment, index) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isLast={index === comments.length - 1}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  isLast,
}: {
  comment: Comment;
  isLast: boolean;
}) {
  const authorName = comment.author?.name || 'Anonymous';
  const authorInitials = authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
      className='flex gap-3'
    >
      {/* Avatar with timeline */}
      <div className='relative flex flex-col items-center'>
        <Avatar className='size-8 shrink-0'>
          <AvatarImage
            alt={authorName}
            src={comment.author?.image || undefined}
          />
          <AvatarFallback className='text-xs'>{authorInitials}</AvatarFallback>
        </Avatar>
        {!isLast && <div className='mt-2 h-full w-px bg-border' />}
      </div>

      {/* Comment content */}
      <div className={cn('flex-1 pb-6', isLast && 'pb-0')}>
        <div className='flex items-center gap-2'>
          <span className='font-medium text-sm'>{authorName}</span>
          <span className='text-muted-foreground text-xs'>{timeAgo}</span>
        </div>
        <p className='mt-1 whitespace-pre-wrap text-sm text-foreground/90'>
          {comment.content}
        </p>
      </div>
    </motion.div>
  );
}

function CommentsSkeleton() {
  return (
    <div className='space-y-4'>
      {[1, 2].map((i) => (
        <div key={i} className='flex gap-3'>
          <div className='size-8 animate-pulse rounded-full bg-muted' />
          <div className='flex-1 space-y-2'>
            <div className='h-4 w-32 animate-pulse rounded bg-muted' />
            <div className='h-3 w-full animate-pulse rounded bg-muted' />
            <div className='h-3 w-2/3 animate-pulse rounded bg-muted' />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyComments() {
  return (
    <div className='flex flex-col items-center justify-center py-8 text-center'>
      <div className='flex size-12 items-center justify-center rounded-full bg-muted/50'>
        <MessageSquare className='size-5 text-muted-foreground/50' />
      </div>
      <p className='mt-3 font-medium text-foreground text-sm'>
        No comments yet
      </p>
      <p className='mt-1 text-muted-foreground text-xs'>
        Be the first to add a comment
      </p>
    </div>
  );
}
