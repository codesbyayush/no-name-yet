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
import { renderStatusIcon } from '@/lib/status-utils';
import { status as allStatus } from '@/mock-data/status';
import { useUpdateIssue } from '@/react-db/issues';

interface StatusSelectorProps {
  issueId: string;
  statusKey?: string;
}

export function StatusSelector({ issueId, statusKey }: StatusSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>(statusKey || 'to-do');
  const { mutate } = useUpdateIssue();

  useEffect(() => {
    if (statusKey) {
      setValue(statusKey);
    }
  }, [statusKey]);

  const handleStatusChange = (statusId: string) => {
    setValue(statusId);
    setOpen(false);

    if (issueId) {
      const newStatus = allStatus.find((s) => s.id === statusId);
      if (newStatus) {
        mutate(issueId, { statusKey: newStatus.key });
      }
    }
  };

  return (
    <div className='*:not-first:mt-2'>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className='flex size-7 items-center justify-center'
            id={id}
            onClick={(e) => {
              e.stopPropagation();
            }}
            role='combobox'
            size='icon'
            variant='ghost'
          >
            {renderStatusIcon(value)}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          className='w-full min-w-(--radix-popper-anchor-width) border-input p-0'
          onClick={(e) => e.stopPropagation()}
        >
          <Command>
            <CommandInput placeholder='Set status...' />
            <CommandList>
              <CommandEmpty>No status found.</CommandEmpty>
              <CommandGroup>
                {allStatus.map((item) => (
                  <CommandItem
                    className='flex items-center justify-between'
                    key={item.id}
                    onSelect={handleStatusChange}
                    value={item.id}
                  >
                    <div className='flex items-center gap-2'>
                      <item.icon />
                      {item.name}
                    </div>
                    {value === item.id && (
                      <CheckIcon className='ml-auto' size={16} />
                    )}
                    <span className='text-muted-foreground text-xs'>
                      {/* {filterByStatus(item.id).length} */}
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
