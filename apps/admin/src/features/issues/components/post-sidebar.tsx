import { Button } from '@workspace/ui/components/button';
import { ArrowRight, Github, Link, Share, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { Issue } from '@/mock-data/issues';
import { useUsers } from '@/react-db/users';
import { buildBranchName } from '@/utils/github';
import { AssigneeSelector } from './assignee-selector';
import { BoardSelector } from './board-selector';
import { LabelSelector } from './label-selector';
import { PrioritySelector } from './priority-selector';
import { StatusSelector } from './status-selector';

interface PostSidebarProps {
  issue: Issue;
}

export function PostSidebar({ issue }: PostSidebarProps) {
  const { data: users } = useUsers();
  const assignee = users?.find((user) => user.id === issue.assigneeId);

  return (
    <div className='h-screen overflow-y-auto bg-sidebar'>
      {/* Header Section */}
      <div className='border-border border-b p-6'>
        <div className='mb-6 flex items-center gap-4 justify-between'>
          <h2 className='font-semibold text-xl'>Manage Post</h2>
          <div className='flex items-center gap-2'>
            <Button className='h-8 w-8' size='icon' variant='ghost'>
              <Link className='h-4 w-4' />
            </Button>
            <Button className='h-8 w-8' size='icon' variant='ghost'>
              <Share className='h-4 w-4' />
            </Button>
            <Button
              className='h-8 w-8'
              onClick={async () => {
                try {
                  const branch = buildBranchName({
                    issueKey: issue.issueKey || '',
                    title: issue.title,
                    assigneeName: assignee?.name || null,
                  });
                  await navigator.clipboard.writeText(branch);
                  toast.success('GitHub branch copied');
                } catch {
                  toast.error('Failed to copy');
                }
              }}
              size='icon'
              type='button'
              variant='ghost'
            >
              <Github className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Post Details Section */}
        <div className='space-y-2'>
          {/* Status */}
          <div className='flex items-center justify-between'>
            <StatusSelector
              issueId={issue.id}
              statusKey={issue.status}
              size='default'
              variant='ghost'
            />
          </div>

          <div className='flex items-center justify-between'>
            <PrioritySelector
              issueId={issue.id}
              priority={issue.priority}
              size='default'
              variant='ghost'
            />
          </div>

          {/* Board */}
          <div className='flex items-center justify-between'>
            <BoardSelector
              boardId={issue.boardId}
              issueId={issue.id}
              size='default'
              variant='ghost'
            />
          </div>

          {/* Tags */}
          <div className='flex items-center justify-between'>
            <LabelSelector
              issueId={issue.id}
              labels={issue.tags ?? []}
              size='default'
              variant='ghost'
            />
          </div>

          {/* Assignee */}
          <div className='flex items-center justify-between'>
            <AssigneeSelector
              assigneeId={issue.assigneeId}
              issueId={issue.id}
              size='default'
              variant='ghost'
            />
          </div>
        </div>
      </div>

      {/* Author Data Section */}
      <div className='p-6'>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Sparkles className='h-4 w-4 text-purple-500' />
              <span className='font-medium text-sm'>View author data</span>
            </div>
            <Button className='h-6 w-6' size='icon' variant='ghost'>
              <ArrowRight className='h-3 w-3' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
