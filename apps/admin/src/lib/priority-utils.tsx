import type React from 'react';
import { priorities } from '@/mock-data/priorities';

export function renderPriorityIcon(
  priorityId: string,
): React.ReactElement | null {
  const selectedItem = priorities.find((item) => item.id === priorityId);
  if (selectedItem) {
    const Icon = selectedItem.icon;
    return <Icon className='size-4 text-muted-foreground' />;
  }
  return null;
}

export function getPriorityById(priorityId: string) {
  return priorities.find((item) => item.id === priorityId);
}
