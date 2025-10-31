import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@workspace/ui/components/command';
import { CheckIcon, ChevronRight, User } from 'lucide-react';
import { useIssueCountByAssignee } from '@/react-db/issues';
import { useFilterStore } from '@/store/filter-store';
import { useUsersStore } from '@/store/users-store';

interface AssigneeFilterProps {
  setActiveFilter: (filter: FilterType | null) => void;
}

type FilterType = 'status' | 'assignee' | 'priority' | 'labels' | 'project';

export function AssigneeFilter({ setActiveFilter }: AssigneeFilterProps) {
  const { users } = useUsersStore();
  const { data: assigneeCount } = useIssueCountByAssignee();
  const { filters, toggleFilter } = useFilterStore();

  return (
    <Command>
      <div className='flex items-center border-b p-2'>
        <Button
          className='size-6'
          onClick={() => setActiveFilter(null)}
          size='icon'
          variant='ghost'
        >
          <ChevronRight className='size-4 rotate-180' />
        </Button>
        <span className='ml-2 font-medium'>Assignee</span>
      </div>
      <CommandInput placeholder='Search assignee...' />
      <CommandList>
        <CommandEmpty>No assignees found.</CommandEmpty>
        <CommandGroup>
          <CommandItem
            className='flex items-center justify-between'
            onSelect={() => toggleFilter('assignee', 'unassigned')}
            value='unassigned'
          >
            <div className='flex items-center gap-2'>
              <User className='size-5' />
              Unassigned
            </div>
            {filters.assignee.includes('unassigned') && (
              <CheckIcon className='ml-auto' size={16} />
            )}
            <span className='text-muted-foreground text-xs'>
              {assigneeCount?.find((assignee) => assignee.assignee === null)
                ?.count || 0}
            </span>
          </CommandItem>
          {users.map((user) => (
            <CommandItem
              className='flex items-center justify-between'
              key={user.id}
              onSelect={() => toggleFilter('assignee', user.id)}
              value={user.id}
            >
              <div className='flex items-center gap-2'>
                <Avatar className='size-5'>
                  <AvatarImage alt={user.name} src={user.avatarUrl} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {user.name}
              </div>
              {filters.assignee.includes(user.id) && (
                <CheckIcon className='ml-auto' size={16} />
              )}
              <span className='text-muted-foreground text-xs'>
                {assigneeCount?.find(
                  (assignee) => assignee.assignee?.id === user.id,
                )?.count || 0}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
