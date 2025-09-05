import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandInput } from '@/components/ui/command';

interface LabelsFilterProps {
  setActiveFilter: (filter: FilterType | null) => void;
}

type FilterType = 'status' | 'assignee' | 'priority' | 'labels' | 'project';

export function LabelsFilter({ setActiveFilter }: LabelsFilterProps) {
  return (
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
      {/* <CommandList>
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
                      {labelCount?.find((label) => label.label.id === tag.id)
                        ?.count || 0}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList> */}
    </Command>
  );
}
