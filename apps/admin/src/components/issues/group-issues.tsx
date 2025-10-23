import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { type FC, useRef } from 'react';
import { useDrop } from 'react-dnd';
import type { Issue } from '@/mock-data/issues';
import { sortIssuesByPriority } from '@/mock-data/issues';
import { status as allStatus, type Status } from '@/mock-data/status';
import { useIssuesByStatus, useUpdateIssue } from '@/react-db/issues';
import { useCreateIssueStore } from '@/store/create-issue-store';
import { useViewStore } from '@/store/view-store';
import { IssueDragType, IssueGrid } from './issue-grid';
import { IssueLine } from './issue-line';

interface GroupIssuesProps {
  statusKey: string;
}

export function GroupIssues({ statusKey }: GroupIssuesProps) {
  const { viewType } = useViewStore();
  const isViewTypeGrid = viewType === 'grid';
  const { openModal } = useCreateIssueStore();
  const { data: issuesByCurrentStatus } = useIssuesByStatus(statusKey);

  const source = issuesByCurrentStatus;
  const sortedIssues = sortIssuesByPriority(source);
  const status: Status = (allStatus.find(
    (status) => status.key === statusKey
  ) || allStatus.find((status) => status.key === 'to-do'))!;

  return (
    <div
      className={cn(
        'bg-conainer',
        isViewTypeGrid
          ? 'flex h-full w-[348px] flex-shrink-0 flex-col overflow-hidden rounded-md'
          : ''
      )}
    >
      <div
        className={cn(
          'sticky top-0 z-10 w-full bg-container',
          isViewTypeGrid ? 'h-[50px] rounded-t-md' : 'h-10'
        )}
      >
        <div
          className={cn(
            'flex h-full w-full items-center justify-between backdrop-blur-xs',
            isViewTypeGrid ? 'px-3' : 'px-6'
          )}
          style={{
            backgroundColor: isViewTypeGrid
              ? `${status?.color}10`
              : `${status?.color}08`,
          }}
        >
          <div className='flex items-center gap-2'>
            <status.icon />
            <span className='font-medium text-sm'>{status.name}</span>
            <span className='text-muted-foreground text-sm'>
              {source.length}
            </span>
          </div>

          <Button
            className='size-6'
            onClick={(e) => {
              e.stopPropagation();
              openModal(status.key);
            }}
            size='icon'
            variant='ghost'
          >
            <Plus className='size-4' />
          </Button>
        </div>
      </div>

      {viewType === 'list' ? (
        <div className='space-y-0'>
          {sortedIssues.map((issue) => (
            <IssueLine issue={issue} key={issue.id} layoutId={true} />
          ))}
        </div>
      ) : (
        <IssueGridList issues={source} status={status} />
      )}
    </div>
  );
}

const IssueGridList: FC<{ issues: Issue[]; status: Status }> = ({
  issues,
  status,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { mutate } = useUpdateIssue();

  // Set up drop functionality to accept only issue items.
  const [{ isOver }, drop] = useDrop(() => ({
    accept: IssueDragType,
    drop(item: Issue, monitor) {
      if (monitor.didDrop() && item.status.id !== status.id) {
        mutate(item.id, { status });
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));
  drop(ref);

  const sortedIssues = sortIssuesByPriority(issues);

  return (
    <div
      className='relative h-full flex-1 space-y-2 overflow-y-auto bg-zinc-50/50 p-2 dark:bg-zinc-900/50'
      ref={ref}
    >
      <AnimatePresence>
        {isOver && (
          <motion.div
            animate={{ opacity: 1 }}
            className='pointer-events-none fixed top-0 right-0 bottom-0 left-0 z-10 flex items-center justify-center bg-background/90'
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            style={{
              width: ref.current?.getBoundingClientRect().width || '100%',
              height: ref.current?.getBoundingClientRect().height || '100%',
              transform: `translate(${ref.current?.getBoundingClientRect().left || 0}px, ${ref.current?.getBoundingClientRect().top || 0}px)`,
            }}
            transition={{ duration: 0.1 }}
          >
            <div className='max-w-[90%] rounded-md border border-border bg-background p-3 shadow-md'>
              <p className='text-center font-medium text-sm'>
                Board ordered by priority
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {sortedIssues.map((issue) => (
        <IssueGrid issue={issue} key={issue.id} />
      ))}
    </div>
  );
};
