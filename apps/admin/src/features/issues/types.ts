export interface Activity {
  id: string;
  feedbackId: string;
  userId: string;
  action: ActivityAction;
  field: string | null;
  oldValue: unknown;
  newValue: unknown;
  metadata: Record<string, unknown> | null;
  createdAt: Date | string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'status_changed'
  | 'priority_changed'
  | 'assigned'
  | 'unassigned'
  | 'tag_added'
  | 'tag_removed'
  | 'board_changed'
  | 'due_date_changed'
  | 'completed'
  | 'description_changed'
  | 'title_changed';
