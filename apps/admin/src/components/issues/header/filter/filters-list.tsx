import {
  BarChart3,
  ChevronRight,
  CircleCheck,
  Folder,
  Tag,
  User,
} from 'lucide-react';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useFilterStore } from '@/store/filter-store';

interface FiltersListProps {
  setActiveFilter: (filter: FilterType) => void;
}

type FilterType = 'status' | 'assignee' | 'priority' | 'labels' | 'project';

export function FiltersList({ setActiveFilter }: FiltersListProps) {
  const { filters, clearFilters, getActiveFiltersCount } = useFilterStore();
  return (
    <Command>
      <CommandList>
        <CommandGroup>
          <CommandItem
            className="flex cursor-pointer items-center justify-between"
            onSelect={() => setActiveFilter('status')}
          >
            <span className="flex items-center gap-2">
              <CircleCheck className="size-4 text-muted-foreground" />
              Status
            </span>
            <div className="flex items-center">
              {filters.status.length > 0 && (
                <span className="mr-1 text-muted-foreground text-xs">
                  {filters.status.length}
                </span>
              )}
              <ChevronRight className="size-4" />
            </div>
          </CommandItem>
          <CommandItem
            className="flex cursor-pointer items-center justify-between"
            onSelect={() => setActiveFilter('assignee')}
          >
            <span className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              Assignee
            </span>
            <div className="flex items-center">
              {filters.assignee.length > 0 && (
                <span className="mr-1 text-muted-foreground text-xs">
                  {filters.assignee.length}
                </span>
              )}
              <ChevronRight className="size-4" />
            </div>
          </CommandItem>
          <CommandItem
            className="flex cursor-pointer items-center justify-between"
            onSelect={() => setActiveFilter('priority')}
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="size-4 text-muted-foreground" />
              Priority
            </span>
            <div className="flex items-center">
              {filters.priority.length > 0 && (
                <span className="mr-1 text-muted-foreground text-xs">
                  {filters.priority.length}
                </span>
              )}
              <ChevronRight className="size-4" />
            </div>
          </CommandItem>
          <CommandItem
            className="flex cursor-pointer items-center justify-between"
            onSelect={() => setActiveFilter('labels')}
          >
            <span className="flex items-center gap-2">
              <Tag className="size-4 text-muted-foreground" />
              Labels
            </span>
            <div className="flex items-center">
              {filters.labels.length > 0 && (
                <span className="mr-1 text-muted-foreground text-xs">
                  {filters.labels.length}
                </span>
              )}
              <ChevronRight className="size-4" />
            </div>
          </CommandItem>
          <CommandItem
            className="flex cursor-pointer items-center justify-between"
            onSelect={() => setActiveFilter('project')}
          >
            <span className="flex items-center gap-2">
              <Folder className="size-4 text-muted-foreground" />
              Project
            </span>
            <div className="flex items-center">
              {filters.project.length > 0 && (
                <span className="mr-1 text-muted-foreground text-xs">
                  {filters.project.length}
                </span>
              )}
              <ChevronRight className="size-4" />
            </div>
          </CommandItem>
        </CommandGroup>
        {getActiveFiltersCount() > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                className="text-destructive"
                onSelect={() => clearFilters()}
              >
                Clear all filters
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  );
}
