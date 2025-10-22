import { Box, CheckIcon } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { priorities } from '@/mock-data/priorities';
import { type Project, projects } from '@/mock-data/projects';
import { status as allStatus } from '@/mock-data/status';
import { users } from '@/mock-data/users';
import { useBoards } from '@/react-db/boards';
import { useIssues } from '@/react-db/issues';

interface ProjectSelectorProps {
  project: Project | undefined;
  onChange: (project: Project | undefined) => void;
}

// Deterministically pick an icon from mock projects for a given id
function pickIconForId(id: string) {
  const icons = projects.map((p) => p.icon);
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return icons[hash % icons.length] ?? Box;
}

export function ProjectSelector({ project, onChange }: ProjectSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string | undefined>(project?.id);

  const { data: boards } = useBoards();
  const { data: issues } = useIssues();

  useEffect(() => {
    setValue(project?.id);
  }, [project]);

  const mappedProjects = useMemo<Project[]>(
    () =>
      (boards ?? []).map((b, idx) => {
        const Icon = pickIconForId(b.id);
        return {
          id: b.id,
          name: b.name,
          status: allStatus[idx % allStatus.length],
          icon: Icon,
          percentComplete: 0,
          startDate: new Date().toISOString().slice(0, 10),
          lead: users[idx % users.length],
          priority: priorities[idx % priorities.length],
          health: {
            id: 'on-track',
            name: 'On Track',
            color: '#00FF00',
            description: '',
          },
        };
      }),
    [boards]
  );

  const handleProjectChange = (projectId: string) => {
    setValue(projectId);
    const newProject = mappedProjects.find((p) => p.id === projectId);
    if (newProject) {
      onChange(newProject);
    }
    setOpen(false);
  };

  return (
    <div className='*:not-first:mt-2'>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className='flex items-center justify-center'
            id={id}
            role='combobox'
            size='sm'
            variant='secondary'
          >
            {value ? (
              (() => {
                const selectedProject = mappedProjects.find(
                  (p) => p.id === value
                );
                if (selectedProject) {
                  const Icon = selectedProject.icon;
                  return <Icon className='size-4' />;
                }
                return <Box className='size-4' />;
              })()
            ) : (
              <Box className='size-4' />
            )}
            <span>
              {value
                ? mappedProjects.find((p) => p.id === value)?.name
                : 'No project'}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          className='w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0'
        >
          <Command>
            <CommandInput placeholder='Set project...' />
            <CommandList>
              <CommandEmpty>No projects found.</CommandEmpty>
              <CommandGroup>
                {/* <CommandItem
									value="no-project"
									onSelect={() => handleProjectChange("no-project")}
									className="flex items-center justify-between"
								>
									<div className="flex items-center gap-2">
										<FolderIcon className="size-4" />
										No Project
									</div>
									{value === undefined && (
										<CheckIcon size={16} className="ml-auto" />
									)}
								</CommandItem> */}
                {mappedProjects.map((project) => (
                  <CommandItem
                    className='flex items-center justify-between'
                    key={project.id}
                    onSelect={() => handleProjectChange(project.id)}
                    value={project.id}
                  >
                    <div className='flex items-center gap-2'>
                      <project.icon className='size-4' />
                      {project.name}
                    </div>
                    {value === project.id && (
                      <CheckIcon className='ml-auto' size={16} />
                    )}
                    <span className='text-muted-foreground text-xs'>
                      {issues?.filter((is) => is.project?.id === project.id)
                        .length ?? 0}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
