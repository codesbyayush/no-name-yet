'use client';

import { CheckIcon } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
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
import { useUpdateIssue } from '@/react-db/issues';

interface PrioritySelectorProps {
  issueId?: string;
  priorityKey?: string;
}

export function PrioritySelector({
  issueId,
  priorityKey,
}: PrioritySelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>(priorityKey || 'no-priority');

  const { mutate } = useUpdateIssue();

  useEffect(() => {
    if (priorityKey) {
      setValue(priorityKey);
    }
  }, [priorityKey]);

  const handlePriorityChange = (priorityId: string) => {
    setValue(priorityId);
    setOpen(false);

    if (issueId) {
      mutate(issueId, { priorityKey: priorityId });
    }
  };

  return (
    <div className="*:not-first:mt-2">
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className="flex size-7 items-center justify-center"
            id={id}
            onClick={(e) => {
              e.stopPropagation();
            }}
            role="combobox"
            size="icon"
            variant="ghost"
          >
            {(() => {
              const selectedItem = priorities.find((item) => item.id === value);
              if (selectedItem) {
                const Icon = selectedItem.icon;
                return <Icon className="size-4 text-muted-foreground" />;
              }
              return null;
            })()}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0"
        >
          <Command>
            <CommandInput placeholder="Set priority..." />
            <CommandList>
              <CommandEmpty>No priority found.</CommandEmpty>
              <CommandGroup>
                {priorities.map((item) => (
                  <CommandItem
                    className="flex items-center justify-between"
                    key={item.id}
                    onSelect={handlePriorityChange}
                    value={item.id}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="size-4 text-muted-foreground" />
                      {item.name}
                    </div>
                    {value === item.id && (
                      <CheckIcon className="ml-auto" size={16} />
                    )}
                    {/* <span className="text-muted-foreground text-xs">
											{filterByPriority(item.id).length}
										</span> */}
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
