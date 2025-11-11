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
import { Box, CheckIcon } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import { pickIconForId } from '@/features/issues/utils/get-random-icons';
import { useBoards } from '@/react-db/boards';
import { useIssues } from '@/react-db/issues';

interface BoardSelectorProps {
  boardId?: string;
  onChange: (boardId: string) => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'secondary' | 'ghost';
}

export function BoardSelector({
  boardId,
  onChange,
  size = 'default',
  variant = 'secondary',
}: BoardSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string | undefined>(boardId);

  const { data: boards } = useBoards();
  const { data: issues } = useIssues();

  const boardsWithIcon = useMemo(() => {
    return (boards ?? []).map((b) => ({
      ...b,
      icon: pickIconForId(b.id),
    }));
  }, [boards]);

  useEffect(() => {
    setValue(boardId);
  }, [boardId]);

  const handleBoardChange = (newBoardId: string) => {
    setValue(newBoardId);
    onChange(newBoardId);
    setOpen(false);
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
            size={size === 'icon' ? 'icon' : size}
            variant={variant}
            onClick={(event) => event.stopPropagation()}
          >
            {value ? (
              (() => {
                const selectedBoard = boardsWithIcon.find(
                  (b) => b.id === value,
                );
                if (selectedBoard) {
                  const Icon = selectedBoard.icon;
                  return <Icon className='size-4' />;
                }
                return <Box className='size-4' />;
              })()
            ) : (
              <Box className='size-4' />
            )}
            {size !== 'icon' && (
              <span className='ml-2 truncate text-left'>
                {value
                  ? boardsWithIcon.find((b) => b.id === value)?.name
                  : 'Set board'}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          className='w-full min-w-(--radix-popper-anchor-width) border-input p-0'
          onClick={(event) => event.stopPropagation()}
        >
          <Command>
            <CommandInput placeholder='Set board...' />
            <CommandList>
              <CommandEmpty>No boards found.</CommandEmpty>
              <CommandGroup>
                {boardsWithIcon.map((board) => (
                  <CommandItem
                    className='flex items-center justify-between'
                    key={board.id}
                    onSelect={() => handleBoardChange(board.id)}
                    value={board.id}
                  >
                    <div className='flex items-center gap-2'>
                      <board.icon className='size-4' />
                      {board.name}
                    </div>
                    {value === board.id && (
                      <CheckIcon className='ml-auto' size={16} />
                    )}
                    <span className='text-muted-foreground text-xs'>
                      {issues?.filter((is) => is.boardId === board.id).length ??
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
