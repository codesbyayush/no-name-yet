import { queryCollectionOptions } from '@tanstack/query-db-collection';
import {
  count,
  createCollection,
  eq,
  ilike,
  inArray,
  lower,
  or,
  useLiveQuery,
} from '@tanstack/react-db';

import { transformServerPostsToIssues } from '@/lib/server-data-transform';
import type { Issue } from '@/mock-data/issues';
import { useFilterStore } from '@/store/filter-store';
import { adminClient } from '@/utils/admin-orpc';
import { queryClient } from '@/utils/orpc';

export type IssueDoc = Issue;

const issuesCollection = createCollection<IssueDoc>(
  queryCollectionOptions<IssueDoc, string>({
    queryKey: ['issues'],
    queryClient,
    staleTime: Number.POSITIVE_INFINITY,
    queryFn: async () => {
      const { posts } = await adminClient.organization.posts.getDetailedPosts({
        offset: 0,
        take: 100,
        sortBy: 'newest',
      });
      return transformServerPostsToIssues(posts);
    },
    getKey: (item) => item.id,
    onUpdate: async ({ transaction }) => {
      const mutation = transaction.mutations[0];
      const changes = mutation.changes as Partial<Issue>;
      // TODO: Fix with shared schema and types from the server
      const payload: any = { id: String(mutation.key) };
      if (changes.title) {
        payload.title = changes.title;
      }
      if (changes.description) {
        payload.description = changes.description;
      }
      if (changes.status) {
        payload.status = changes.status;
      }
      if (changes.priority) {
        payload.priority = changes.priority;
      }
      if (changes.assigneeId) {
        payload.assigneeId = changes.assigneeId;
      }
      if (changes.assigneeId === null) {
        payload.assigneeId = null;
      }
      if (changes.tags) {
        payload.tags = changes.tags;
      }
      if (changes.boardId) {
        payload.boardId = changes.boardId;
      }
      if (changes.dueDate) {
        payload.dueDate = changes.dueDate;
      }
      if (changes.completedAt) {
        payload.completedAt = changes.completedAt;
      }

      await adminClient.organization.posts.update(payload);

      // Invalidate activity history query
      queryClient.invalidateQueries({
        queryKey: ['activity-history', payload.id],
      });
    },
    onDelete: async ({ transaction }) => {
      const mutation = transaction.mutations[0];
      await adminClient.organization.posts.delete({
        id: mutation.key as string,
      });
    },
    onInsert: async ({ transaction }) => {
      const mutation = transaction.mutations[0];
      const changes = mutation.changes as Issue;

      await adminClient.organization.posts.create({
        ...changes,
        assigneeId: changes.assigneeId ?? undefined,
        priority:
          changes.priority && changes.priority !== 'no-priority'
            ? (changes.priority as
                | 'no-priority'
                | 'low'
                | 'medium'
                | 'high'
                | 'urgent'
                | undefined)
            : 'no-priority',
        status: changes.status as
          | 'to-do'
          | 'in-progress'
          | 'completed'
          | 'backlog'
          | 'technical-review'
          | 'paused'
          | 'pending'
          | undefined,
        tags: changes?.tags ?? undefined,
      });

      // Invalidate activity history query
      queryClient.invalidateQueries({
        queryKey: ['activity-history', changes.id],
      });
    },
  }),
);

export const useIssues = () =>
  useLiveQuery((q) => q.from({ issue: issuesCollection }));

export const useIssueById = (id: string | undefined) =>
  useLiveQuery((q) =>
    q
      .from({ issue: issuesCollection })
      .where(({ issue }) => (id ? eq(issue.id, id) : false))
      .orderBy(({ issue }) => issue.createdAt, 'desc')
      .limit(1),
  );

export const useExternalPendingIssues = () =>
  useLiveQuery((q) =>
    q
      .from({ issue: issuesCollection })
      .where(({ issue }) => eq(issue.status, 'pending')),
  );

export const useIssuesByStatus = (statusId: string | undefined) =>
  useLiveQuery((q) =>
    q
      .from({ issue: issuesCollection })
      .where(({ issue }) => eq(issue.status, statusId)),
  );

export const useFilteredIssuesByStatus = (statusId: string | null) => {
  const { filters } = useFilterStore();

  const filterDeps = [
    statusId,
    filters.status?.join(',') || '',
    filters.priority?.join(',') || '',
    filters.assignee?.join(',') || '',
    filters.labels?.join(',') || '',
    filters.board?.join(',') || '',
  ];

  return useLiveQuery((q) => {
    let query = q.from({ issue: issuesCollection });
    if (statusId) {
      query = query.where(({ issue }) => eq(issue.status, statusId));
    }
    if (filters.status && filters.status.length > 0) {
      query = query.where(({ issue }) => inArray(issue.status, filters.status));
    }
    if (filters.priority && filters.priority.length > 0) {
      query = query.where(({ issue }) =>
        inArray(issue.priority, filters.priority),
      );
    }
    if (filters.assignee && filters.assignee.length > 0) {
      const assigneeIds = filters.assignee.filter((id) => id !== 'unassigned');
      const hasUnassigned = filters.assignee.includes('unassigned');

      if (hasUnassigned && assigneeIds.length > 0) {
        query = query.where(({ issue }) =>
          or(
            eq(issue.assigneeId as any, null),
            inArray(issue.assigneeId, assigneeIds),
          ),
        );
      } else if (hasUnassigned) {
        query = query.where(({ issue }) => eq(issue.assigneeId as any, null));
      } else {
        query = query.where(({ issue }) =>
          inArray(issue.assigneeId, assigneeIds),
        );
      }
    }
    if (filters.board && filters.board.length > 0) {
      query = query.where(({ issue }) => inArray(issue.boardId, filters.board));
    }
    if (filters.labels && filters.labels.length > 0) {
      query = query.where(({ issue }) => {
        const conditions = filters.labels.map((label) =>
          inArray(label, issue.tags),
        );
        if (conditions.length === 0) return false;
        if (conditions.length === 1) return conditions[0];

        // Type assertion needed because 'or' requires a tuple type, not an array with minimum length of 2
        return or(
          ...(conditions as [
            (typeof conditions)[0],
            (typeof conditions)[0],
            ...(typeof conditions)[],
          ]),
        );
      });
    }

    return query;
  }, filterDeps);
};

export const useIssueCountByStatus = () =>
  useLiveQuery((q) =>
    q
      .from({ issue: issuesCollection })
      .groupBy(({ issue }) => issue.status)
      .select(({ issue }) => ({
        count: count(issue.id),
        statusId: issue.status,
      })),
  );

export const useIssueCountByBoard = () =>
  useLiveQuery((q) =>
    q
      .from({ issue: issuesCollection })
      .groupBy(({ issue }) => issue.boardId)
      .select(({ issue }) => ({
        count: count(issue.id),
        boardId: issue.boardId || 'No board',
      })),
  );

export const useIssueCountByAssignee = () =>
  useLiveQuery((q) =>
    q
      .from({ issue: issuesCollection })
      .groupBy(({ issue }) =>
        issue.assigneeId != null ? issue.assigneeId : 'Unassigned',
      )
      .select(({ issue }) => ({
        count: count(issue.id),
        assigneeId: issue.assigneeId != null ? issue.assigneeId : 'Unassigned',
      })),
  );

export const useIssueCountByPriority = () =>
  useLiveQuery((q) =>
    q
      .from({ issue: issuesCollection })
      .groupBy(({ issue }) => issue.priority)
      .select(({ issue }) => ({
        count: count(issue.id),
        priority: issue.priority,
      })),
  );

export const useIssueCountForLabel = (labelId: string) =>
  useLiveQuery((q) =>
    q
      .from({ issue: issuesCollection })
      .select(({ issue }) => ({
        count: count(issue.id),
        labelId: labelId,
      }))
      .where(({ issue }) => inArray(issue.tags, labelId)),
  );

export const useSearchIssues = (query: string | undefined) => {
  const safe = (query ?? '').trim().toLowerCase();
  return useLiveQuery(
    (q) =>
      q.from({ issue: issuesCollection }).where(({ issue }) => {
        if (!safe) {
          return true;
        }
        const title = lower(issue.title);
        const titleMatch = ilike(title, `%${safe}%`);
        return issue.issueKey !== null
          ? ilike(lower(issue.issueKey as unknown as string), `%${safe}%`) ||
              titleMatch
          : titleMatch;
      }),
    [safe],
  );
};

export const useAddIssue = () => ({
  mutate: (issue: IssueDoc) => issuesCollection.insert(issue),
});

export const useUpdateIssue = () => ({
  mutate: (id: string, updated: Partial<IssueDoc>) =>
    issuesCollection.update(id, (draft) => Object.assign(draft, updated)),
});

export const useDeleteIssue = () => ({
  mutate: (id: string) => issuesCollection.delete(id),
});

export const useIssuesCount = () => {
  const { data } = useIssues();
  return { data: data?.length } as const;
};

export const useFilteredIssues = () => {
  return useFilteredIssuesByStatus(null);
};
