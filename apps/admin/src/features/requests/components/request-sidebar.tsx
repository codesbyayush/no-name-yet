import { useQuery } from '@tanstack/react-query';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import { Separator } from '@workspace/ui/components/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { format } from 'date-fns';
import {
  Calendar,
  Check,
  ExternalLink,
  Folder,
  Loader2,
  MessageSquare,
  ThumbsUp,
  X,
} from 'lucide-react';
import type { Issue } from '@/mock-data/issues';
import { useBoardById } from '@/react-db/boards';
import { MetadataRow } from '@/shared/components';
import { client } from '@/utils/orpc';

interface RequestSidebarProps {
  request: Issue;
  getPublicUrl: (requestId: string) => string;
  handlePromote: (requestId: string) => void;
  handleDiscard: (requestId: string) => void;
  isProcessing?: boolean;
}

export function RequestSidebar({
  request,
  getPublicUrl,
  handlePromote,
  handleDiscard,
  isProcessing = false,
}: RequestSidebarProps) {
  const { data: board } = useBoardById(request.boardId);
  const boardName = board?.[0]?.name ?? 'No board';

  // Fetch vote count
  const { data: voteCount } = useQuery({
    queryKey: ['vote-count', request.id],
    queryFn: async () => {
      const count = await client.public.votes.count({
        feedbackId: request.id,
      });
      return count;
    },
  });

  // Fetch comment count
  const { data: commentCount } = useQuery({
    queryKey: ['comment-count', request.id],
    queryFn: async () => {
      const count = await client.public.comments.count({
        feedbackId: request.id,
      });
      return count;
    },
  });

  const createdDate = request.createdAt
    ? format(new Date(request.createdAt), 'MMM dd, yyyy')
    : 'Unknown';

  const authorName = request.author?.name || 'Anonymous';
  const authorInitials = authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <TooltipProvider>
      <div className='flex h-screen w-80 shrink-0 flex-col overflow-y-auto border-l border-border bg-sidebar'>
        {/* Header Section */}
        <div className='border-b border-border p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='flex size-6 items-center justify-center rounded-md bg-amber-500/10'>
                <div className='size-2 rounded-full bg-amber-500' />
              </div>
              <span className='font-medium text-muted-foreground text-sm'>
                Pending Review
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className='flex gap-2'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => handlePromote(request.id)}
                  size='sm'
                  className='flex-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300'
                  variant='ghost'
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className='mr-1.5 size-4 animate-spin' />
                  ) : (
                    <Check className='mr-1.5 size-4' />
                  )}
                  {isProcessing ? 'Processing...' : 'Promote'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Promote to main issues</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => handleDiscard(request.id)}
                  size='sm'
                  className='flex-1 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300'
                  variant='ghost'
                  disabled={isProcessing}
                >
                  <X className='mr-1.5 size-4' />
                  Discard
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Discard this request</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Metadata Section */}
        <div className='flex-1 space-y-1 p-6'>
          <h3 className='mb-4 font-semibold text-sm'>Details</h3>

          <MetadataRow icon={Folder} label='Board' value={boardName} />
          <MetadataRow icon={Calendar} label='Created' value={createdDate} />
          <MetadataRow
            icon={ThumbsUp}
            label='Votes'
            value={String(voteCount ?? 0)}
          />
          <MetadataRow
            icon={MessageSquare}
            label='Comments'
            value={String(commentCount ?? 0)}
          />

          <Separator className='my-4' />

          {/* Author Section */}
          <h3 className='mb-4 font-semibold text-sm'>Author</h3>
          <div className='flex items-center gap-3 rounded-lg bg-muted/50 p-3'>
            <Avatar className='size-9'>
              <AvatarImage
                alt={authorName}
                src={request.author?.avatarUrl || undefined}
              />
              <AvatarFallback className='text-xs'>
                {authorInitials}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0 flex-1'>
              <p className='truncate font-medium text-sm'>{authorName}</p>
              {request.author?.email && (
                <p className='truncate text-muted-foreground text-xs'>
                  {request.author.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='border-t border-border p-4'>
          <a
            href={getPublicUrl(request.id)}
            target='_blank'
            rel='noopener noreferrer'
            className='flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm transition-colors hover:bg-muted'
          >
            <ExternalLink className='size-4' />
            View on public portal
          </a>
        </div>
      </div>
    </TooltipProvider>
  );
}
