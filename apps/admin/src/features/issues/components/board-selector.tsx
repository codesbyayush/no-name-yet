import { useUpdateIssue } from '@/react-db/issues';
import { BoardSelector as BoardSelectorBase } from './create-new-issue/board-selector';

interface BoardSelectorProps {
  issueId?: string;
  boardId?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'secondary' | 'ghost';
  onChange?: (boardId: string) => void;
}

export function BoardSelector({
  issueId,
  boardId,
  size = 'icon',
  variant = 'ghost',
  onChange,
}: BoardSelectorProps) {
  const { mutate } = useUpdateIssue();

  const handleBoardChange = (newBoardId: string) => {
    if (issueId) {
      mutate(issueId, { boardId: newBoardId });
    }
    onChange?.(newBoardId);
  };

  return (
    <BoardSelectorBase
      boardId={boardId}
      onChange={handleBoardChange}
      size={size}
      variant={variant}
    />
  );
}
