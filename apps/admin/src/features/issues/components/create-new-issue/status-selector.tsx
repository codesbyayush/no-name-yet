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
import { status as allStatus } from '@/mock-data/status';
import { useIssues } from '@/react-db/issues';

interface StatusSelectorProps {
  status: string;
  onChange: (statusId: string) => void;
}

export function StatusSelector({ status, onChange }: StatusSelectorProps) {
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
            className='flex items-center justify-center'
            id={id}
            role='combobox'
            size='sm'
            variant='secondary'
          >
            {(() => {
              const selectedItem = allStatus.find((item) => item.id === value);
              if (selectedItem) {
                const Icon = selectedItem.icon;
                return <Icon />;
              }
              return null;
            })()}
            <span>
              {value ? allStatus.find((s) => s.id === value)?.name : 'To do'}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          className='w-full min-w-(--radix-popper-anchor-width) border-input p-0'
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
                    onSelect={() => handleStatusChange(item.id)}
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
