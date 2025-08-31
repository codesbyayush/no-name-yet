import { LayoutGrid, LayoutList, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useViewStore, type ViewType } from '@/store/view-store';
import { Filter } from './filter';

export default function HeaderOptions() {
  const { viewType, setViewType } = useViewStore();

  const handleViewChange = (type: ViewType) => {
    setViewType(type);
  };

  return (
    <div className="flex h-10 w-full items-center justify-between border-b px-6 py-1.5">
      <Filter />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="relative" size="xs" variant="secondary">
            <SlidersHorizontal className="mr-1 size-4" />
            Display
            {viewType === 'grid' && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-orange-500" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="flex w-72 gap-2 p-3">
          <DropdownMenuItem
            className={cn(
              'flex w-full flex-col gap-1 border border-accent text-xs',
              viewType === 'list' ? 'bg-accent' : ''
            )}
            onClick={() => handleViewChange('list')}
          >
            <LayoutList className="size-4" />
            List
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn(
              'flex w-full flex-col gap-1 border border-accent text-xs',
              viewType === 'grid' ? 'bg-accent' : ''
            )}
            onClick={() => handleViewChange('grid')}
          >
            <LayoutGrid className="size-4" />
            Board
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
