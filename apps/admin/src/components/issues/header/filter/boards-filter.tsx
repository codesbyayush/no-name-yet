import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandInput } from '@/components/ui/command';

interface BoardsFilterProps {
  setActiveFilter: (filter: FilterType | null) => void;
}

type FilterType = 'status' | 'assignee' | 'priority' | 'labels' | 'project';

export function BoardsFilter({ setActiveFilter }: BoardsFilterProps) {
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
        <span className='ml-2 font-medium'>Project</span>
      </div>
      <CommandInput placeholder='Search projects...' />
      {/* <CommandList>
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
                      {projectCount?.find(
                        (project) => project.project.id === project.id
                      )?.count || 0}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList> */}
    </Command>
  );
}
