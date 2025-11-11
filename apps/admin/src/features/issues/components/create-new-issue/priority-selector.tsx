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
import { CheckIcon } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { renderPriorityIcon } from '@/lib/priority-utils';
import { priorities } from '@/mock-data/priorities';
import { useIssues } from '@/react-db/issues';

interface PrioritySelectorProps {
  priority: string;
  onChange: (priorityId: string) => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'secondary' | 'ghost';
}

export function PrioritySelector({
  priority,
  onChange,
  size = 'default',
  variant = 'secondary',
}: PrioritySelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>(priority);

  const { data: issues } = useIssues();

  useEffect(() => {
    setValue(priority);
  }, [priority]);

  const handlePriorityChange = (priorityId: string) => {
    setValue(priorityId);
    setOpen(false);

    onChange(priorityId);
  };

  return (
    <div className='*:not-first:mt-2'>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className={cn(
              'flex items-center justify-center py-1.5',
              size === 'icon' ? 'size-7' : 'size-full',
            )}
            id={id}
            role='combobox'
            size={size}
            variant={variant}
            onClick={(e) => e.stopPropagation()}
          >
            {renderPriorityIcon(value)}
            {size !== 'icon' && (
              <span>
                {value
                  ? priorities.find((p) => p.id === value)?.name
                  : 'Set priority'}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          className='w-full min-w-(--radix-popper-anchor-width) border-input p-0'
          onClick={(e) => e.stopPropagation()}
        >
          <Command>
            <CommandInput placeholder='Set priority...' />
            <CommandList>
              <CommandEmpty>No priority found.</CommandEmpty>
              <CommandGroup>
                {priorities.map((item) => (
                  <CommandItem
                    className='flex items-center justify-between'
                    key={item.id}
                    onSelect={() => handlePriorityChange(item.id)}
                    value={item.id}
                  >
                    <div className='flex items-center gap-2'>
                      <item.icon className='size-4 text-muted-foreground' />
                      {item.name}
                    </div>
                    {value === item.id && (
                      <CheckIcon className='ml-auto' size={16} />
                    )}
                    <span className='text-muted-foreground text-xs'>
                      {issues?.filter((is) => is.priority === item.id).length ??
                        0}
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
