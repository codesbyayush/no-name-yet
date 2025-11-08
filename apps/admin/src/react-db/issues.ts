import { queryCollectionOptions } from '@tanstack/query-db-collection';
import {
  count,
  createCollection,
  eq,
  ilike,
  lower,
  useLiveQuery,
} from '@tanstack/react-db';
import { transformServerPostsToIssues } from '@/lib/server-data-transform';
import type { Issue } from '@/mock-data/issues';
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
      if (changes.statusKey) {
        payload.status = changes.statusKey;
      }
      if (changes.priority) {
        payload.priority = changes.priority.id;
      }
      if (changes.priorityKey) {
        payload.priority = changes.priorityKey;
      }
      if ('assignee' in changes) {
        payload.assigneeId = changes.assignee?.id ?? null;
      }
      await adminClient.organization.posts.update(payload);
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
        priority:
          changes.priorityKey && changes.priorityKey !== 'no-priority'
            ? (changes.priorityKey as
                | 'no-priority'
                | 'low'
                | 'medium'
                | 'high'
                | 'urgent'
                | undefined)
            : 'no-priority',
        status: changes.statusKey as
          | 'to-do'
          | 'in-progress'
          | 'completed'
          | 'backlog'
          | 'technical-review'
          | 'paused'
          | 'pending'
          | undefined,
        tags: changes.tags.map((tag) => tag.id),
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
      .where(({ issue }) => eq(issue.status.key, 'pending')),
  );

export const useIssuesByStatus = (statusId: string | undefined) =>
  useLiveQuery((q) =>
    q
      .from({ issue: issuesCollection })
      .where(({ issue }) =>
        issue.statusKey && statusId ? eq(issue.statusKey, statusId) : false,
      ),
  );

export const useIssueCountByStatus = () =>
  useLiveQuery((q) =>
    q
      .from({ issue: issuesCollection })
      .groupBy(({ issue }) => issue.status.id)
      .select(({ issue }) => ({
        count: count(issue.id),
        statusId: issue.status.id,
      })),
  );

export const useIssueCountByAssignee = () =>
  useLiveQuery((q) =>
    q
      .from({ issue: issuesCollection })
      .groupBy(({ issue }) => issue.assignee)
      .select(({ issue }) => ({
        count: count(issue.id),
        assignee: issue.assignee,
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

export const useIssueCountByLabel = (labelId: string) =>
  useLiveQuery((q) =>
    q
      .from({ issue: issuesCollection })
      .where(({ issue }) => issue.tags.some((tag) => eq(tag.id, labelId))),
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
        const identifier = lower(issue.issueKey || '');
        return ilike(title, `%${safe}%`) || ilike(identifier, `%${safe}%`);
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

export const issues = issuesCollection;
