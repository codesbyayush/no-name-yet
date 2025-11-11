import { useUpdateIssue } from '@/react-db/issues';
import { AssigneeSelector as AssigneeSelectorBase } from './create-new-issue/assignee-selector';

interface AssigneeSelectorProps {
  issueId?: string;
  assigneeId?: string | null;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'secondary' | 'ghost';
  onChange?: (assignee?: string | null) => void;
}

export function AssigneeSelector({
  issueId,
  assigneeId,
  size = 'icon',
  variant = 'ghost',
  onChange,
}: AssigneeSelectorProps) {
  const { mutate } = useUpdateIssue();

  const handleAssigneeChange = (newAssignee?: string | null) => {
    if (issueId) {
      mutate(issueId, { assigneeId: newAssignee ?? null });
    }
    onChange?.(newAssignee);
  };

  return (
    <AssigneeSelectorBase
      assigneeId={assigneeId}
      onChange={handleAssigneeChange}
      size={size}
      variant={variant}
    />
  );
}
