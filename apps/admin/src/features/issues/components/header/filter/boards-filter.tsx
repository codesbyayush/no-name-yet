import { Button } from '@workspace/ui/components/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@workspace/ui/components/command';
import { CheckIcon, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import { pickIconForId } from '@/features/issues/utils/get-random-icons';
import { useBoards } from '@/react-db/boards';
import { useIssueCountByBoard } from '@/react-db/issues';
import { useFilterStore } from '@/store/filter-store';

interface BoardsFilterProps {
  setActiveFilter: (filter: FilterType | null) => void;
}

type FilterType = 'status' | 'assignee' | 'priority' | 'labels' | 'board';

export function BoardsFilter({ setActiveFilter }: BoardsFilterProps) {
  const { toggleFilter, filters } = useFilterStore();
  const { data: boards } = useBoards();

  const boardsWithIcon = useMemo(() => {
    return boards?.map((board) => ({
      ...board,
      icon: pickIconForId(board.id),
    }));
  }, [boards]);

  const { data: issueCountByBoard } = useIssueCountByBoard();

  return (
    <Command>
      <div className='flex items-center border-b p-2'>
        <Button
          className='size-6'
          onClick={() => setActiveFilter(null)}
          size='icon'
          variant='ghost'
        >
          <ChevronRight className='size-4 rotate-180' />
        </Button>
        <span className='ml-2 font-medium'>Board</span>
      </div>
      <CommandInput placeholder='Search boards...' />
      <CommandList>
        <CommandEmpty>No boards found.</CommandEmpty>
        <CommandGroup>
          {boardsWithIcon?.map((board) => (
            <CommandItem
              className='flex items-center justify-between'
              key={board.id}
              onSelect={() => toggleFilter('board', board.id)}
              value={board.id}
            >
              <div className='flex items-center gap-2'>
                <board.icon className='size-4' />
                {board.name}
              </div>
              {filters.board.includes(board.id) && (
                <CheckIcon className='ml-auto' size={16} />
              )}
              <span className='text-muted-foreground text-xs'>
                {issueCountByBoard?.find((b) => b.boardId === board.id)
                  ?.count || 0}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
