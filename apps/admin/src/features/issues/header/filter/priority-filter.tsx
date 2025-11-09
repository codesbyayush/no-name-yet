import { Button } from '@workspace/ui/components/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@workspace/ui/components/command';
import { CheckIcon, ChevronRight } from 'lucide-react';
import { priorities } from '@/mock-data/priorities';
import { useIssueCountByPriority } from '@/react-db/issues';
import { useFilterStore } from '@/store/filter-store';

interface PriorityFilterProps {
  setActiveFilter: (filter: FilterType | null) => void;
}

type FilterType = 'status' | 'assignee' | 'priority' | 'labels' | 'project';

export function PriorityFilter({ setActiveFilter }: PriorityFilterProps) {
  const { data: priorityCount } = useIssueCountByPriority();
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
        <span className='ml-2 font-medium'>Priority</span>
      </div>
      <CommandInput placeholder='Search priority...' />
      <CommandList>
        <CommandEmpty>No priorities found.</CommandEmpty>
        <CommandGroup>
          {priorities.map((item) => (
            <CommandItem
              className='flex items-center justify-between'
              key={item.id}
              onSelect={() => toggleFilter('priority', item.id)}
              value={item.id}
            >
              <div className='flex items-center gap-2'>
                <item.icon className='size-4 text-muted-foreground' />
                {item.name}
              </div>
              {filters.priority.includes(item.id) && (
                <CheckIcon className='ml-auto' size={16} />
              )}
              <span className='text-muted-foreground text-xs'>
                {priorityCount?.find(
                  (priority) => priority.priority === item.id,
                )?.count || 0}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
