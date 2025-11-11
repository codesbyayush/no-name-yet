import { priorities } from '@/mock-data/priorities';
import type { Activity } from '../types';

export const formatActivityDescription = (
  activity: Activity,
  statuses?: Array<{ key: string; name: string }>,
  boards?: Array<{ id: string; name: string }>,
  tags?: Array<{ id: string; name: string }>,
  users?: Array<{ id: string; name: string }>,
): string => {
  const action = activity.action;

  switch (action) {
    case 'created':
      return 'created the issue';
    case 'status_changed': {
      const oldStatusKey = String(activity.oldValue || '');
      const newStatusKey = String(activity.newValue || '');
      const oldStatus =
        statuses?.find((s) => s.key === oldStatusKey)?.name ||
        oldStatusKey.replace(/-/g, ' ');
      const newStatus =
        statuses?.find((s) => s.key === newStatusKey)?.name ||
        newStatusKey.replace(/-/g, ' ');
      return `moved from ${oldStatus} to ${newStatus}`;
    }
    case 'assigned': {
      const assigneeId = String(activity.newValue || '');
      const assigneeName =
        users?.find((u) => u.id === assigneeId)?.name || 'someone';
      return `assigned to ${assigneeName}`;
    }
    case 'unassigned':
      return 'unassigned the issue';
    case 'tag_added': {
      const tagId = String(activity.newValue || '');
      const tagName = tags?.find((t) => t.id === tagId)?.name || tagId;
      return `added tag "${tagName}"`;
    }
    case 'tag_removed': {
      const tagId = String(activity.oldValue || '');
      const tagName = tags?.find((t) => t.id === tagId)?.name || tagId;
      return `removed tag "${tagName}"`;
    }
    case 'priority_changed': {
      const oldPriorityId = String(activity.oldValue || '');
      const newPriorityId = String(activity.newValue || '');
      const oldPriority =
        priorities.find((p) => p.id === oldPriorityId)?.name ||
        oldPriorityId.replace(/-/g, ' ');
      const newPriority =
        priorities.find((p) => p.id === newPriorityId)?.name ||
        newPriorityId.replace(/-/g, ' ');
      return `changed priority from ${oldPriority} to ${newPriority}`;
    }
    case 'board_changed': {
      const oldBoardId = String(activity.oldValue || '');
      const newBoardId = String(activity.newValue || '');
      const oldBoard =
        boards?.find((b) => b.id === oldBoardId)?.name || 'another board';
      const newBoard =
        boards?.find((b) => b.id === newBoardId)?.name || 'another board';
      return `moved from ${oldBoard} to ${newBoard}`;
    }
    case 'due_date_changed': {
      const oldDate = activity.oldValue
        ? new Date(String(activity.oldValue)).toLocaleDateString()
        : 'None';
      const newDate = activity.newValue
        ? new Date(String(activity.newValue)).toLocaleDateString()
        : 'None';
      return `changed due date from ${oldDate} to ${newDate}`;
    }
    case 'completed':
      return 'marked as completed';
    case 'title_changed':
      return 'changed the title';
    case 'description_changed':
      return 'updated the description';
    case 'deleted':
      return 'deleted the issue';
    default:
      return action.replace(/_/g, ' ');
  }
};
