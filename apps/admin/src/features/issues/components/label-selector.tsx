import { useUpdateIssue } from '@/react-db/issues';
import { LabelSelector as LabelSelectorBase } from './create-new-issue/label-selector';

interface LabelSelectorProps {
  issueId?: string;
  labels?: string[];
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'secondary' | 'ghost';
  onChange?: (labels: string[]) => void;
}

export function LabelSelector({
  issueId,
  labels,
  size = 'icon',
  variant = 'ghost',
  onChange,
}: LabelSelectorProps) {
  const { mutate } = useUpdateIssue();

  const handleLabelChange = (newLabels: string[]) => {
    if (issueId) {
      mutate(issueId, { tags: newLabels });
    }
    onChange?.(newLabels);
  };

  return (
    <LabelSelectorBase
      selectedLabels={labels ?? []}
      onChange={handleLabelChange}
      size={size}
      variant={variant}
    />
  );
}
