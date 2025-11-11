import { adminIssueStatus } from '@/mock-data/status';
import { useUpdateIssue } from '@/react-db/issues';
import { StatusSelector as StatusSelectorBase } from './create-new-issue/status-selector';

interface StatusSelectorProps {
  issueId: string;
  statusKey?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'secondary' | 'ghost';
}

export function StatusSelector({
  issueId,
  statusKey,
  size = 'icon',
  variant = 'ghost',
}: StatusSelectorProps) {
  const { mutate } = useUpdateIssue();

  const handleStatusChange = (statusId: string) => {
    if (issueId) {
      const newStatus = adminIssueStatus.find((s) => s.id === statusId);
      if (newStatus) {
        mutate(issueId, { status: newStatus.key });
      }
    }
  };

  return (
    <StatusSelectorBase
      status={statusKey || 'to-do'}
      onChange={handleStatusChange}
      size={size}
      variant={variant}
    />
  );
}
