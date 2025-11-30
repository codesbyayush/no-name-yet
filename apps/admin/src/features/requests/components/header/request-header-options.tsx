import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { cn } from '@workspace/ui/lib/utils';
import { ArrowDownUp, Calendar, Clock, ThumbsUp } from 'lucide-react';
import { useMemo } from 'react';
import { useExternalPendingIssues } from '@/react-db/issues';
import { type RequestSortBy, useRequestStore } from '@/store/request-store';

const sortOptions: {
  value: RequestSortBy;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: 'newest', label: 'Newest first', icon: Clock },
  { value: 'oldest', label: 'Oldest first', icon: Calendar },
  { value: 'votes', label: 'Most votes', icon: ThumbsUp },
];

export function RequestHeaderOptions() {
  const { sortBy, setSortBy, searchQuery } = useRequestStore();
  const { data: externalPendingIssues, isLoading } = useExternalPendingIssues();

  const filteredAndSortedRequests = useMemo(() => {
    if (!externalPendingIssues) return [];

    let filtered = externalPendingIssues;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (issue) =>
          issue.title?.toLowerCase().includes(query) ||
          issue.description?.toLowerCase().includes(query),
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 'votes':
          // When vote count is available from server, use it here
          // For now, sort by date as fallback
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'newest':
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    return sorted;
  }, [externalPendingIssues, sortBy, searchQuery]);

  return (
    <div className='flex h-10 w-full items-center justify-between border-b px-6 py-1.5'>
      {/* Request count header */}
      <div className='sticky top-0 z-10 flex h-8 items-center justify-between bg-container/95 px-1.5 backdrop-blur-sm'>
        {!isLoading && (
          <div className='flex items-center gap-2'>
            <span className='font-medium text-foreground text-sm'>
              Pending Review
            </span>
            <span className='rounded-full bg-amber-500/10 px-2 py-0.5 font-medium text-amber-600 text-[10px] dark:text-amber-400'>
              {filteredAndSortedRequests.length}
            </span>
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className='relative' size='sm' variant='ghost'>
            <ArrowDownUp className='mr-1.5 size-3.5' />
            Sort
            {sortBy !== 'newest' && (
              <span className='absolute top-0 right-0 h-2 w-2 rounded-full bg-amber-500' />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-44'>
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              className={cn(
                'flex cursor-pointer items-center gap-2',
                sortBy === option.value && 'bg-accent',
              )}
              onClick={() => setSortBy(option.value)}
            >
              <option.icon className='size-3.5 text-muted-foreground' />
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
