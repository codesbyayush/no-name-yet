import { useQuery } from '@tanstack/react-query';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { adminIssueStatus as statuses } from '@/mock-data/status';
import { useBoards } from '@/react-db/boards';
import { useTags } from '@/react-db/tags';
import { useUsers } from '@/react-db/users';
import { adminClient } from '@/utils/admin-orpc';
import type { Activity } from '../types';
import { formatActivityDescription } from '../utils/format-activity-description';
import { formatDate } from '../utils/format-date';

interface ActivityHistoryProps {
  feedbackId: string;
}

export function ActivityHistory({ feedbackId }: ActivityHistoryProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activity-history', feedbackId],
    queryFn: async () => {
      const result = await adminClient.organization.posts.getActivityHistory({
        feedbackId,
      });
      return result as Activity[];
    },
  });

  const { data: users } = useUsers();
  const { data: tags } = useTags();
  const { data: boards } = useBoards();

  if (isLoading) {
    return (
      <div className='p-6'>
        <div className='mb-4'>
          <h3 className='font-semibold text-sm'>Activity</h3>
        </div>
        <div className='text-muted-foreground text-sm'>Loading...</div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className='p-6'>
        <div className='mb-4'>
          <h3 className='font-semibold text-sm'>Activity</h3>
        </div>
        <div className='text-muted-foreground text-sm'>No activity yet</div>
      </div>
    );
  }

  return (
    <div className='border-border border-t p-6'>
      <div className='mb-4'>
        <h3 className='font-semibold text-sm'>Activity</h3>
      </div>
      <div className='space-y-4'>
        {activities.map((activity) => {
          const activityUser = users?.find((u) => u.id === activity.userId);
          const userName = activityUser?.name || 'Unknown user';
          const userInitials = userName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
          const avatarUrl = activityUser?.image || undefined;

          return (
            <div key={activity.id} className='flex gap-3'>
              {/* Avatar/Icon */}
              <div className='shrink-0'>
                {activityUser && (
                  <Avatar className='h-6 w-6'>
                    <AvatarImage alt={userName} src={avatarUrl} />
                    <AvatarFallback className='text-xs'>
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>

              {/* Content */}
              <div className='min-w-0 flex-1'>
                <div className='text-sm'>
                  <span className='font-medium'>{userName}</span>{' '}
                  <span className='text-muted-foreground'>
                    {formatActivityDescription(
                      activity,
                      statuses?.map((s) => ({ key: s.key, name: s.name })),
                      boards?.map((b) => ({ id: b.id, name: b.name })),
                      tags?.map((t) => ({ id: t.id, name: t.name })),
                      users?.map((u) => ({ id: u.id, name: u.name })),
                    )}
                  </span>
                </div>
                <div className='text-muted-foreground text-xs'>
                  {formatDate(
                    typeof activity.createdAt === 'string'
                      ? activity.createdAt
                      : activity.createdAt.toISOString(),
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
