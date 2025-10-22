import { useQuery } from '@tanstack/react-query';
import { Box, CheckIcon } from 'lucide-react';
import { useId, useState } from 'react';
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
import { client } from '@/utils/orpc';

interface BoardSelectorProps {
  board: string;
  onChange: (board: string) => void;
}

export function BoardSelector({ board, onChange }: BoardSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);

  const { data: allBoards } = useQuery({
    queryKey: ['boards'],
    queryFn: () => client.public.boards.getAll(),
    staleTime: Number.POSITIVE_INFINITY,
  });

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
            {board ? (
              (() => <Box className='size-4' />)()
            ) : (
              <Box className='size-4' />
            )}
            <span>
              {board
                ? allBoards?.boards.find((p) => p.id === board)?.name
                : 'No board'}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          className='w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0'
        >
          <Command>
            <CommandInput placeholder='Set board...' />
            <CommandList>
              <CommandEmpty>No boards found.</CommandEmpty>
              <CommandGroup>
                {allBoards?.boards.map((b) => (
                  <CommandItem
                    className='flex items-center justify-between'
                    key={b.id}
                    onSelect={() => onChange(b.id)}
                    value={b.id}
                  >
                    <div className='flex items-center gap-2'>{b.name}</div>
                    {board === b.id && (
                      <CheckIcon className='ml-auto' size={16} />
                    )}
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
