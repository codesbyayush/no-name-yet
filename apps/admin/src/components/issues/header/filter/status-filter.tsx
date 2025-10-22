import { CheckIcon, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { status as allStatus } from '@/mock-data/status';
import { useIssueCountByStatus } from '@/react-db/issues';
import { useFilterStore } from '@/store/filter-store';

interface StatusFilterProps {
  setActiveFilter: (filter: FilterType | null) => void;
}

type FilterType = 'status' | 'assignee' | 'priority' | 'labels' | 'project';

export function StatusFilter({ setActiveFilter }: StatusFilterProps) {
  const { data: statusCount } = useIssueCountByStatus();
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
        <span className='ml-2 font-medium'>Status</span>
      </div>
      <CommandInput placeholder='Search status...' />
      <CommandList>
        <CommandEmpty>No status found.</CommandEmpty>
        <CommandGroup>
          {allStatus.map((item) => (
            <CommandItem
              className='flex items-center justify-between'
              key={item.id}
              onSelect={() => toggleFilter('status', item.id)}
              value={item.id}
            >
              <div className='flex items-center gap-2'>
                <item.icon />
                {item.name}
              </div>
              {filters.status.includes(item.id) && (
                <CheckIcon className='ml-auto' size={16} />
              )}
              <span className='text-muted-foreground text-xs'>
                {statusCount?.find((status) => status.statusId === item.id)
                  ?.count || 0}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
