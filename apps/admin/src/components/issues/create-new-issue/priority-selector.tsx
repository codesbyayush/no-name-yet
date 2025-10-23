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
import { CheckIcon } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { priorities } from '@/mock-data/priorities';
import { useIssues } from '@/react-db/issues';

interface PrioritySelectorProps {
  priorityKey: string;
  onChange: (priorityId: string) => void;
}

export function PrioritySelector({
  priorityKey,
  onChange,
}: PrioritySelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>(priorityKey);

  const { data: issues } = useIssues();

  useEffect(() => {
    setValue(priorityKey);
  }, [priorityKey]);

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
            className='flex items-center justify-center'
            id={id}
            role='combobox'
            size='sm'
            variant='secondary'
          >
            {(() => {
              const selectedItem = priorities.find((item) => item.id === value);
              if (selectedItem) {
                const Icon = selectedItem.icon;
                return <Icon className='size-4 text-muted-foreground' />;
              }
              return null;
            })()}
            <span>
              {value
                ? priorities.find((p) => p.id === value)?.name
                : 'No priority'}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          className='w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0'
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
                      {issues?.filter((is) => is.priorityKey === item.id)
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
