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
import { renderStatusIcon } from '@/lib/status-utils';
import { adminIssueStatus } from '@/mock-data/status';
import { useIssues } from '@/react-db/issues';

interface StatusSelectorProps {
  status: string;
  onChange: (statusId: string) => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'secondary' | 'ghost';
}

export function StatusSelector({
  status,
  onChange,
  size = 'default',
  variant = 'secondary',
}: StatusSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>(status);

  const { data: issues } = useIssues();

  useEffect(() => {
    setValue(status);
  }, [status]);

  const handleStatusChange = (statusId: string) => {
    setValue(statusId);
    setOpen(false);

    onChange(statusId);
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
            {renderStatusIcon(value)}
            {size !== 'icon' && (
              <span>
                {value
                  ? adminIssueStatus.find((s) => s.id === value)?.name
                  : 'Set status'}
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
            <CommandInput placeholder='Set status' />
            <CommandList>
              <CommandEmpty>No status found.</CommandEmpty>
              <CommandGroup>
                {adminIssueStatus.map((item) => (
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
                      {issues?.filter((is) => is.status === item.id).length ??
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
