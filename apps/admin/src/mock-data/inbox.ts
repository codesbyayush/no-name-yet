import type { LabelInterface } from './labels';
import type { Priority } from './priorities';
import type { Project } from './projects';
import type { Status } from './status';
import type { User } from './users';

export type NotificationType =
  | 'comment'
  | 'mention'
  | 'assignment'
  | 'status'
  | 'reopened'
  | 'closed'
  | 'edited'
  | 'created'
  | 'upload';

export interface InboxItem {
  id: string;
  identifier: string;
  title: string;
  description: string;
  status: Status;
  assignee: User | null;
  priority: Priority;
  labels: LabelInterface[];
  createdAt: string;
  project?: Project;
  subissues?: string[];
  dueDate?: string;
  content: string;
  type: NotificationType;
  user: User;
  timestamp: string;
  read: boolean;
}

export const filterByReadStatus = (
  items: InboxItem[],
  isRead: boolean
): InboxItem[] => {
  return items.filter((item) => item.read === isRead);
};

export const filterByType = (
  items: InboxItem[],
  type: NotificationType
): InboxItem[] => {
  return items.filter((item) => item.type === type);
};

export const filterByUser = (
  items: InboxItem[],
  userId: string
): InboxItem[] => {
  return items.filter((item) => item.user.id === userId);
};

export const markAsRead = (items: InboxItem[], itemId: string): InboxItem[] => {
  return items.map((item) =>
    item.id === itemId ? { ...item, read: true } : item
  );
};

export const markAllAsRead = (items: InboxItem[]): InboxItem[] => {
  return items.map((item) => ({ ...item, read: true }));
};
