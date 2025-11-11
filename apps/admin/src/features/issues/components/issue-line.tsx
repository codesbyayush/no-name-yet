import { useNavigate } from '@tanstack/react-router';
import {
  ContextMenu,
  ContextMenuTrigger,
} from '@workspace/ui/components/context-menu';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import type { Issue } from '@/mock-data/issues';
import { AssigneeUser } from './assignee-user';
import { IssueContextMenu } from './issue-context-menu';
import { LabelBadge } from './label-badge';
import { PrioritySelector } from './priority-selector';
import { StatusSelector } from './status-selector';

export function IssueLine({
  issue,
  layoutId = false,
}: {
  issue: Issue;
  layoutId?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <motion.div
          {...(layoutId && {
            layoutId: `issue-line-${issue.issueKey}`,
          })}
          className='flex h-11 w-full items-center justify-start px-6 hover:bg-sidebar/50'
          onClick={() => {
            navigate({
              to: '/boards/$postId',
              params: { postId: issue.id },
            });
          }}
        >
          <div className='flex items-center gap-0.5'>
            <PrioritySelector
              issueId={issue.id}
              priority={issue.priority}
              size='icon'
              variant='ghost'
            />
            <span className='mr-0.5 hidden w-[66px] shrink-0 truncate align-bottom font-medium text-muted-foreground text-sm uppercase sm:inline-block'>
              {issue.issueKey}
            </span>
            <StatusSelector
              issueId={issue.id}
              statusKey={issue.status}
              size='icon'
              variant='ghost'
            />
          </div>
          <span className='mr-1 ml-0.5 flex min-w-0 items-center justify-start'>
            <span className='truncate text-xs sm:text-sm'>{issue.title}</span>
          </span>
          <div className='ml-auto flex items-center justify-end gap-2 sm:w-fit'>
            <div className='w-3 shrink-0' />
            <div className='-space-x-5 hidden items-center justify-end transition-all duration-200 hover:space-x-1 sm:flex lg:space-x-1'>
              {issue.tags && <LabelBadge tags={issue.tags} />}
            </div>
            <span className='hidden shrink-0 text-muted-foreground text-xs sm:inline-block'>
              {format(new Date(issue.createdAt), 'MMM dd')}
            </span>
            <AssigneeUser
              issueId={issue.id}
              userId={issue.assigneeId ?? undefined}
            />
          </div>
        </motion.div>
      </ContextMenuTrigger>
      <IssueContextMenu issueId={issue.id} />
    </ContextMenu>
  );
}
