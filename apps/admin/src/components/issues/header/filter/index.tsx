import { ListFilter } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTags } from '@/hooks/use-tags';
import { useFilterStore } from '@/store/filter-store';
import { AssigneeFilter } from './assignee-filter';
import { BoardsFilter } from './boards-filter';
import { FiltersList } from './filters-list';
import { LabelsFilter } from './labels-filter';
import { PriorityFilter } from './priority-filter';
import { StatusFilter } from './status-filter';

// Define filter types
type FilterType = 'status' | 'assignee' | 'priority' | 'labels' | 'project';

export function Filter() {
  const [open, setOpen] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<FilterType | null>(null);

  const { getActiveFiltersCount } = useFilterStore();

  const _data = useTags();

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button className='relative' size='sm' variant='ghost'>
          <ListFilter className='mr-1 size-4' />
          Filter
          {getActiveFiltersCount() > 0 && (
            <span className='-top-1 -right-1 absolute flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground'>
              {getActiveFiltersCount()}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-60 p-0'>
        {(() => {
          switch (activeFilter) {
            case 'status':
              return <StatusFilter setActiveFilter={setActiveFilter} />;
            case 'assignee':
              return <AssigneeFilter setActiveFilter={setActiveFilter} />;
            case 'priority':
              return <PriorityFilter setActiveFilter={setActiveFilter} />;
            case 'labels':
              return <LabelsFilter setActiveFilter={setActiveFilter} />;
            case 'project':
              return <BoardsFilter setActiveFilter={setActiveFilter} />;
            default:
              return <FiltersList setActiveFilter={setActiveFilter} />;
          }
        })()}
      </PopoverContent>
    </Popover>
  );
}
