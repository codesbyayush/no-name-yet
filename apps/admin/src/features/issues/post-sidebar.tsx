import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import {
  ArrowRight,
  ArrowUp,
  Calendar,
  ChevronDown,
  Github,
  Link,
  MoreHorizontal,
  Share,
  Sparkles,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Issue } from '@/mock-data/issues';
import { buildBranchName } from '@/utils/github';

import { StatusSelector } from './status-selector';

interface PostSidebarProps {
  issue: Issue;
}

export function PostSidebar({ issue }: PostSidebarProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays === 0) {
      return 'Today';
    }
    if (diffInDays === 1) {
      return 'Yesterday';
    }
    if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    }
    if (diffInDays < 30) {
      return `About ${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    }
    if (diffInDays < 365) {
      return `About ${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
    }
    return `About ${Math.floor(diffInDays / 365)} year${Math.floor(diffInDays / 365) > 1 ? 's' : ''} ago`;
  };

  return (
    <div className='h-screen overflow-y-auto bg-sidebar'>
      {/* Header Section */}
      <div className='border-border border-b p-6'>
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='font-semibold text-xl'>Manage Post</h2>
          <div className='flex items-center gap-2'>
            <Button className='h-8 w-8' size='icon' variant='ghost'>
              <ArrowUp className='h-4 w-4' />
            </Button>
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
                    issueKey: issue.issueKey,
                    title: issue.title,
                    assigneeName: issue.assignee?.name || null,
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
            <Button className='h-8 w-8' size='icon' variant='ghost'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Post Details Section */}
        <div className='space-y-4'>
          {/* Status */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-purple-500' />
              <span className='font-medium text-sm'>Status</span>
            </div>
            <div className='flex items-center gap-2'>
              <StatusSelector issueId={issue.id} statusKey={issue.statusKey} />
              <span className='text-muted-foreground text-sm'>
                {issue.status.name}
              </span>
              <Button className='h-6 w-6' size='icon' variant='ghost'>
                <ChevronDown className='h-3 w-3' />
              </Button>
            </div>
          </div>

          {/* Board */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-yellow-500' />
              <span className='font-medium text-sm'>Board</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground text-sm'>
                {/*  TODO: fix this */}
                {/* {issue.board?.name || 'Feature Request'} */}
                Feature Request
              </span>
              <Button className='h-6 w-6' size='icon' variant='ghost'>
                <ChevronDown className='h-3 w-3' />
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-gray-500' />
              <span className='font-medium text-sm'>Tags</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground text-sm'>
                {issue.tags.length > 0
                  ? `${issue.tags.length} selected`
                  : 'Unselected'}
              </span>
              <Button className='h-6 w-6' size='icon' variant='ghost'>
                <ChevronDown className='h-3 w-3' />
              </Button>
            </div>
          </div>

          {/* Date */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-muted-foreground' />
              <span className='font-medium text-sm'>Date</span>
            </div>
            <span className='text-muted-foreground text-sm'>
              {formatDate(issue.createdAt)}
            </span>
          </div>

          {/* Author */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <User className='h-4 w-4 text-muted-foreground' />
              <span className='font-medium text-sm'>Author</span>
            </div>
            <div className='flex items-center gap-2'>
              <Avatar className='h-6 w-6'>
                <AvatarImage
                  alt={issue.assignee?.name}
                  src={issue.assignee?.avatarUrl}
                />
                <AvatarFallback className='bg-orange-500 text-white text-xs'>
                  {issue.assignee?.name?.[0] || 'A'}
                </AvatarFallback>
              </Avatar>
              <span className='text-muted-foreground text-sm'>
                {issue.assignee?.name || 'ayush patel'}
              </span>
              {issue.assignee && (
                <div className='h-2 w-2 rounded-full border border-background bg-blue-500' />
              )}
            </div>
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
