import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { format } from 'date-fns';
import { Check, ExternalLink, X } from 'lucide-react';
import type { Issue } from '@/mock-data/issues';

interface RequestLineProps {
  issue: Issue;
  getPublicUrl: (issueId: string) => string;
  handlePromote: (issueId: string) => void;
  handleDiscard: (issueId: string) => void;
}

export function RequestLine({
  issue,
  getPublicUrl,
  handlePromote,
  handleDiscard,
}: RequestLineProps) {
  const boardName = issue.board?.name ?? issue.project?.name ?? null;
  const createdAtLabel = issue.createdAt
    ? format(new Date(issue.createdAt), 'MMM dd, yyyy')
    : null;

  return (
    <div
      key={issue.id}
      className='flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/30 transition-colors'
    >
      <div className='flex min-w-0 flex-1 items-center gap-2'>
        <span className='truncate text-sm font-medium text-foreground'>
          {issue.title || 'Untitled issue'}
        </span>
      </div>
      <div className='flex shrink-0 gap-2'>
        <div className='flex min-w-0 flex-1 items-center px-4'>
          <div className='flex shrink-0 items-center gap-4 text-[11px] font-medium text-muted-foreground'>
            {boardName && (
              <span className='inline-flex items-center rounded bg-muted px-2 py-1 text-[11px] text-muted-foreground'>
                {boardName}
              </span>
            )}
            {createdAtLabel && (
              <span className='inline-flex items-center rounded bg-muted px-2 py-1 text-[11px] text-muted-foreground'>
                {createdAtLabel}
              </span>
            )}
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type='button'
              onClick={() => handlePromote(issue.id)}
              className='h-8 w-8 flex items-center justify-center rounded-md bg-green-100 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/50 hover:bg-green-200 dark:hover:bg-green-950/40 hover:border-green-300/50 dark:hover:border-green-700/50 transition-colors group'
              aria-label='Promote issue'
            >
              <Check className='h-4 w-4 text-green-600 dark:text-green-500 group-hover:text-green-700 dark:group-hover:text-green-400' />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Promote to main issues</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={getPublicUrl(issue.id)}
              target='_blank'
              rel='noopener noreferrer'
              className='h-8 w-8 flex items-center justify-center rounded-md bg-blue-100 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50 hover:bg-blue-200 dark:hover:bg-blue-950/40 hover:border-blue-300/50 dark:hover:border-blue-700/50 transition-colors group'
              aria-label='View on public portal'
            >
              <ExternalLink className='h-4 w-4 text-blue-600 dark:text-blue-500 group-hover:text-blue-700 dark:group-hover:text-blue-400' />
            </a>
          </TooltipTrigger>
          <TooltipContent>
            <p>View on public portal</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type='button'
              onClick={() => handleDiscard(issue.id)}
              className='h-8 w-8 flex items-center justify-center rounded-md bg-red-100 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/50 hover:bg-red-200 dark:hover:bg-red-950/40 hover:border-red-300/50 dark:hover:border-red-700/50 transition-colors group'
              aria-label='Discard issue'
            >
              <X className='h-4 w-4 text-red-600 dark:text-red-500 group-hover:text-red-700 dark:group-hover:text-red-400' />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Discard issue</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
