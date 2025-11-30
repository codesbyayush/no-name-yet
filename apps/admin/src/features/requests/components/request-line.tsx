import { useNavigate } from '@tanstack/react-router';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { cn } from '@workspace/ui/lib/utils';
import { format } from 'date-fns';
import {
  Check,
  ExternalLink,
  Loader2,
  MessageSquare,
  ThumbsUp,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { Issue } from '@/mock-data/issues';
import { useBoardById } from '@/react-db/boards';

interface RequestLineProps {
  issue: Issue;
  getPublicUrl: (issueId: string) => string;
  handlePromote: (issueId: string) => void;
  handleDiscard: (issueId: string) => void;
  isProcessing?: boolean;
  isAnyProcessing?: boolean;
}

export function RequestLine({
  issue,
  getPublicUrl,
  handlePromote,
  handleDiscard,
  isProcessing = false,
  isAnyProcessing = false,
}: RequestLineProps) {
  const navigate = useNavigate();
  const { data: board } = useBoardById(issue.boardId);
  const boardName = board?.[0]?.name ?? null;
  const createdAtLabel = issue.createdAt
    ? format(new Date(issue.createdAt), 'MMM dd, yyyy')
    : null;

  const handleRowClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on action buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    navigate({
      to: '/requests/$requestId',
      params: { requestId: issue.id },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      className='group flex h-14 w-full cursor-pointer items-center justify-between border-b border-border/50 px-6 transition-colors hover:bg-accent/30'
      onClick={handleRowClick}
    >
      {/* Left section - Status indicator & Title */}
      <div className='flex min-w-0 flex-1 items-center gap-3'>
        {/* Pending status indicator */}
        <div className='flex size-6 shrink-0 items-center justify-center'>
          <div className='size-2.5 rounded-full bg-amber-500/80 ring-4 ring-amber-500/10' />
        </div>

        {/* Title */}
        <span className='truncate font-medium text-foreground text-sm'>
          {issue.title || 'Untitled request'}
        </span>
      </div>

      {/* Right section - Meta info & Actions */}
      <div className='flex shrink-0 items-center gap-3'>
        {/* Meta badges */}
        <div className='hidden items-center gap-2 sm:flex'>
          {boardName && (
            <span className='inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1 text-[11px] font-medium text-muted-foreground'>
              {boardName}
            </span>
          )}

          {/* Placeholder for vote count - will be populated when server returns it */}
          <span className='inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1 text-[11px] font-medium text-muted-foreground'>
            <ThumbsUp className='size-3' />0
          </span>

          {/* Placeholder for comment count */}
          <span className='inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1 text-[11px] font-medium text-muted-foreground'>
            <MessageSquare className='size-3' />0
          </span>
        </div>

        {/* Date */}
        {createdAtLabel && (
          <span className='hidden shrink-0 text-muted-foreground text-xs lg:inline-block'>
            {createdAtLabel}
          </span>
        )}

        {/* Action buttons */}
        <div
          className={cn(
            'flex items-center gap-1.5 transition-opacity',
            isAnyProcessing
              ? 'opacity-100'
              : 'opacity-60 group-hover:opacity-100',
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type='button'
                onClick={() => handlePromote(issue.id)}
                disabled={isAnyProcessing}
                className={cn(
                  'flex size-8 items-center justify-center rounded-md transition-all',
                  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                  'hover:bg-emerald-500/20 hover:text-emerald-700 dark:hover:text-emerald-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
                aria-label='Promote to issues'
              >
                {isProcessing ? (
                  <Loader2 className='size-4 animate-spin' />
                ) : (
                  <Check className='size-4' />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side='bottom' className='text-xs'>
              <p>{isProcessing ? 'Processing...' : 'Promote to issues'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={getPublicUrl(issue.id)}
                target='_blank'
                rel='noopener noreferrer'
                className={cn(
                  'flex size-8 items-center justify-center rounded-md transition-all',
                  'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                  'hover:bg-blue-500/20 hover:text-blue-700 dark:hover:text-blue-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
                  isAnyProcessing && 'pointer-events-none opacity-50',
                )}
                aria-label='View on public portal'
              >
                <ExternalLink className='size-4' />
              </a>
            </TooltipTrigger>
            <TooltipContent side='bottom' className='text-xs'>
              <p>View on public portal</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type='button'
                onClick={() => handleDiscard(issue.id)}
                disabled={isAnyProcessing}
                className={cn(
                  'flex size-8 items-center justify-center rounded-md transition-all',
                  'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                  'hover:bg-rose-500/20 hover:text-rose-700 dark:hover:text-rose-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
                aria-label='Discard request'
              >
                <X className='size-4' />
              </button>
            </TooltipTrigger>
            <TooltipContent side='bottom' className='text-xs'>
              <p>Discard request</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
}
