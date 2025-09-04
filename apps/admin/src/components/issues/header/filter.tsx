import {
  BarChart3,
  CheckIcon,
  ChevronRight,
  CircleCheck,
  Folder,
  ListFilter,
  Tag,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTags } from '@/hooks/use-tags';
import { priorities } from '@/mock-data/priorities';
import { projects } from '@/mock-data/projects';
import { StatusIconWithKey } from '@/mock-data/status';
import { useStatuses } from '@/react-db';
import { useFilterStore } from '@/store/filter-store';
import { useIssuesStore } from '@/store/issues-store';
import { useUsersStore } from '@/store/users-store';

// Define filter types
type FilterType = 'status' | 'assignee' | 'priority' | 'labels' | 'project';

export function Filter() {
  const [open, setOpen] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<FilterType | null>(null);

  const { filters, toggleFilter, clearFilters, getActiveFiltersCount } =
    useFilterStore();

  const {
    filterByStatus,
    filterByAssignee,
    filterByPriority,
    filterByLabel,
    filterByProject,
  } = useIssuesStore();

  const { data: tags } = useTags();
  const { users } = useUsersStore();
  const { data: statuses } = useStatuses();
  const allStatus = statuses?.map((status) => ({
    ...status,
    icon: () => <StatusIconWithKey statusKey={status.key} />,
  }));

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button className="relative" size="sm" variant="ghost">
          <ListFilter className="mr-1 size-4" />
          Filter
          {getActiveFiltersCount() > 0 && (
            <span className="-top-1 -right-1 absolute flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {getActiveFiltersCount()}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 p-0">
        {activeFilter === null ? (
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
        ) : activeFilter === 'status' ? (
          <Command>
            <div className="flex items-center border-b p-2">
              <Button
                className="size-6"
                onClick={() => setActiveFilter(null)}
                size="icon"
                variant="ghost"
              >
                <ChevronRight className="size-4 rotate-180" />
              </Button>
              <span className="ml-2 font-medium">Status</span>
            </div>
            <CommandInput placeholder="Search status..." />
            <CommandList>
              <CommandEmpty>No status found.</CommandEmpty>
              <CommandGroup>
                {allStatus.map((item) => (
                  <CommandItem
                    className="flex items-center justify-between"
                    key={item.id}
                    onSelect={() => toggleFilter('status', item.id)}
                    value={item.id}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon />
                      {item.name}
                    </div>
                    {filters.status.includes(item.id) && (
                      <CheckIcon className="ml-auto" size={16} />
                    )}
                    <span className="text-muted-foreground text-xs">
                      {filterByStatus(item.id).length}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : activeFilter === 'assignee' ? (
          <Command>
            <div className="flex items-center border-b p-2">
              <Button
                className="size-6"
                onClick={() => setActiveFilter(null)}
                size="icon"
                variant="ghost"
              >
                <ChevronRight className="size-4 rotate-180" />
              </Button>
              <span className="ml-2 font-medium">Assignee</span>
            </div>
            <CommandInput placeholder="Search assignee..." />
            <CommandList>
              <CommandEmpty>No assignees found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  className="flex items-center justify-between"
                  onSelect={() => toggleFilter('assignee', 'unassigned')}
                  value="unassigned"
                >
                  <div className="flex items-center gap-2">
                    <User className="size-5" />
                    Unassigned
                  </div>
                  {filters.assignee.includes('unassigned') && (
                    <CheckIcon className="ml-auto" size={16} />
                  )}
                  <span className="text-muted-foreground text-xs">
                    {filterByAssignee(null).length}
                  </span>
                </CommandItem>
                {users.map((user) => (
                  <CommandItem
                    className="flex items-center justify-between"
                    key={user.id}
                    onSelect={() => toggleFilter('assignee', user.id)}
                    value={user.id}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="size-5">
                        <AvatarImage alt={user.name} src={user.avatarUrl} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {user.name}
                    </div>
                    {filters.assignee.includes(user.id) && (
                      <CheckIcon className="ml-auto" size={16} />
                    )}
                    <span className="text-muted-foreground text-xs">
                      {filterByAssignee(user.id).length}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : activeFilter === 'priority' ? (
          <Command>
            <div className="flex items-center border-b p-2">
              <Button
                className="size-6"
                onClick={() => setActiveFilter(null)}
                size="icon"
                variant="ghost"
              >
                <ChevronRight className="size-4 rotate-180" />
              </Button>
              <span className="ml-2 font-medium">Priority</span>
            </div>
            <CommandInput placeholder="Search priority..." />
            <CommandList>
              <CommandEmpty>No priorities found.</CommandEmpty>
              <CommandGroup>
                {priorities.map((item) => (
                  <CommandItem
                    className="flex items-center justify-between"
                    key={item.id}
                    onSelect={() => toggleFilter('priority', item.id)}
                    value={item.id}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="size-4 text-muted-foreground" />
                      {item.name}
                    </div>
                    {filters.priority.includes(item.id) && (
                      <CheckIcon className="ml-auto" size={16} />
                    )}
                    <span className="text-muted-foreground text-xs">
                      {filterByPriority(item.id).length}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : activeFilter === 'labels' ? (
          <Command>
            <div className="flex items-center border-b p-2">
              <Button
                className="size-6"
                onClick={() => setActiveFilter(null)}
                size="icon"
                variant="ghost"
              >
                <ChevronRight className="size-4 rotate-180" />
              </Button>
              <span className="ml-2 font-medium">Labels</span>
            </div>
            <CommandInput placeholder="Search labels..." />
            <CommandList>
              <CommandEmpty>No labels found.</CommandEmpty>
              <CommandGroup>
                {tags.map((tag) => (
                  <CommandItem
                    className="flex items-center justify-between"
                    key={tag.id}
                    onSelect={() => toggleFilter('labels', tag.id)}
                    value={tag.id}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </div>
                    {filters.labels.includes(tag.id) && (
                      <CheckIcon className="ml-auto" size={16} />
                    )}
                    <span className="text-muted-foreground text-xs">
                      {filterByLabel(tag.id).length}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : activeFilter === 'project' ? (
          <Command>
            <div className="flex items-center border-b p-2">
              <Button
                className="size-6"
                onClick={() => setActiveFilter(null)}
                size="icon"
                variant="ghost"
              >
                <ChevronRight className="size-4 rotate-180" />
              </Button>
              <span className="ml-2 font-medium">Project</span>
            </div>
            <CommandInput placeholder="Search projects..." />
            <CommandList>
              <CommandEmpty>No projects found.</CommandEmpty>
              <CommandGroup>
                {projects.map((project) => (
                  <CommandItem
                    className="flex items-center justify-between"
                    key={project.id}
                    onSelect={() => toggleFilter('project', project.id)}
                    value={project.id}
                  >
                    <div className="flex items-center gap-2">
                      <project.icon className="size-4" />
                      {project.name}
                    </div>
                    {filters.project.includes(project.id) && (
                      <CheckIcon className="ml-auto" size={16} />
                    )}
                    <span className="text-muted-foreground text-xs">
                      {filterByProject(project.id).length}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
