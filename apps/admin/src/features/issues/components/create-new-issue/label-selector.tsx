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
import { useIssues } from '@/react-db/issues';
import { useTags } from '@/react-db/tags';

interface LabelSelectorProps {
  selectedLabels: string[];
  onChange: (labels: string[]) => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'secondary' | 'ghost';
}

export function LabelSelector({
  selectedLabels,
  onChange,
  size = 'icon',
  variant = 'secondary',
}: LabelSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);

  const { data: issues } = useIssues();
  const { data: tags } = useTags();
  const availableTags = tags ?? [];
  const selectedTagData = availableTags.filter((tag) =>
    selectedLabels.includes(tag.id),
  );
  const hasSelectedTags = selectedTagData.length > 0;
  const buttonSize = size === 'icon' ? (hasSelectedTags ? 'sm' : 'icon') : size;

  const handleLabelToggle = (tag: string) => {
    const isSelected = selectedLabels.includes(tag);
    let newLabels: string[];

    if (isSelected) {
      newLabels = selectedLabels.filter((l) => l !== tag);
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
              'flex items-center justify-center py-1.5',
              buttonSize === 'icon' ? 'size-7' : 'size-full ',
            )}
            id={id}
            role='combobox'
            size={buttonSize}
            variant={variant}
            onClick={(event) => event.stopPropagation()}
          >
            <TagIcon />
            {hasSelectedTags ? (
              <div
                className={cn(
                  'ml-2 flex items-center gap-1',
                  size === 'icon' && 'ml-1',
                )}
              >
                <div className='-space-x-0.5 flex items-center py-0.5'>
                  {selectedTagData.slice(0, 4).map((tag) => {
                    return (
                      <div
                        className='size-4 rounded-full border border-border'
                        key={tag.id}
                        style={{ backgroundColor: tag.color }}
                      />
                    );
                  })}
                  {selectedTagData.length > 4 && (
                    <span className='pl-1 text-muted-foreground text-xs'>
                      +{selectedTagData.length - 4}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              size !== 'icon' && (
                <span className='ml-2 truncate text-left text-sm'>
                  {hasSelectedTags
                    ? `${selectedTagData.length} selected`
                    : 'Set tags'}
                </span>
              )
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          className='w-full min-w-(--radix-popper-anchor-width) border-input p-0'
          onClick={(event) => event.stopPropagation()}
        >
          <Command>
            <CommandInput placeholder='Search labels...' />
            <CommandList>
              <CommandEmpty>No labels found.</CommandEmpty>
              <CommandGroup>
                {availableTags.map((tag) => {
                  const isSelected = selectedLabels.includes(tag.id);
                  return (
                    <CommandItem
                      className='flex items-center justify-between'
                      key={tag.id}
                      onSelect={() => handleLabelToggle(tag.id)}
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
                        {issues?.filter((is) => is.tags?.includes(tag.id))
                          .length ?? 0}
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
