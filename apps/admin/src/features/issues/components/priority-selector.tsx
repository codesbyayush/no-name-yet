import { useUpdateIssue } from '@/react-db/issues';
import { PrioritySelector as PrioritySelectorBase } from './create-new-issue/priority-selector';

interface PrioritySelectorProps {
  issueId?: string;
  priority?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'secondary' | 'ghost';
}

export function PrioritySelector({
  issueId,
  priority,
  size = 'icon',
  variant = 'ghost',
}: PrioritySelectorProps) {
  const { mutate } = useUpdateIssue();

  const handlePriorityChange = (priorityId: string) => {
    if (issueId) {
      mutate(issueId, { priority: priorityId });
    }
  };

  return (
    <PrioritySelectorBase
      size={size}
      variant={variant}
      priority={priority || 'no-priority'}
      onChange={handlePriorityChange}
    />
  );
}
