import { Button } from '@workspace/ui/components/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@workspace/ui/components/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover';
import { cn } from '@workspace/ui/lib/utils';
import { CheckIcon, TagIcon } from 'lucide-react';
import { useId, useState } from 'react';
import { useTags } from '@/hooks/use-tags';
import type { LabelInterface } from '@/mock-data/labels';
import { useIssues } from '@/react-db/issues';

interface LabelSelectorProps {
  selectedLabels: LabelInterface[];
  onChange: (labels: LabelInterface[]) => void;
}

export function LabelSelector({
  selectedLabels,
  onChange,
}: LabelSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);

  const { data: issues } = useIssues();
  const { data: tags } = useTags();

  const handleLabelToggle = (tag: LabelInterface) => {
    const isSelected = selectedLabels.some((l) => l.id === tag.id);
    let newLabels: LabelInterface[];

    if (isSelected) {
      newLabels = selectedLabels.filter((l) => l.id !== tag.id);
    } else {
      newLabels = [...selectedLabels, tag];
    }

    onChange(newLabels);
  };

  return (
    <div className='*:not-first:mt-2'>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className={cn(
              'flex items-center justify-center',
              selectedLabels.length === 0 && 'size-7',
            )}
            id={id}
            role='combobox'
            size={selectedLabels.length > 0 ? 'sm' : 'icon'}
            variant='secondary'
          >
            <TagIcon className='size-4' />
            {selectedLabels.length > 0 && (
              <div className='-space-x-0.5 flex'>
                {selectedLabels.map((tag) => (
                  <div
                    className='size-3 rounded-full'
                    key={tag.id}
                    style={{ backgroundColor: tag.color }}
                  />
                ))}
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          className='w-full min-w-(--radix-popper-anchor-width) border-input p-0'
        >
          <Command>
            <CommandInput placeholder='Search labels...' />
            <CommandList>
              <CommandEmpty>No labels found.</CommandEmpty>
              <CommandGroup>
                {tags.map((tag) => {
                  const isSelected = selectedLabels.some(
                    (l) => l.id === tag.id,
                  );
                  return (
                    <CommandItem
                      className='flex items-center justify-between'
                      key={tag.id}
                      onSelect={() => handleLabelToggle(tag)}
                      value={tag.id}
                    >
                      <div className='flex items-center gap-2'>
                        <div
                          className='size-3 rounded-full'
                          style={{ backgroundColor: tag.color }}
                        />
                        <span>{tag.name}</span>
                      </div>
                      {isSelected && (
                        <CheckIcon className='ml-auto' size={16} />
                      )}
                      <span className='text-muted-foreground text-xs'>
                        {issues?.filter((is) =>
                          is.tags?.some((l) => l.id === tag.id),
                        ).length ?? 0}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
