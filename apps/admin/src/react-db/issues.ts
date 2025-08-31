import { transformServerPostsToIssues } from "@/lib/server-data-transform";
import type { Issue } from "@/mock-data/issues";
import { adminClient } from "@/utils/admin-orpc";
import { queryClient } from "@/utils/orpc";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import {
	createCollection,
	eq,
	ilike,
	lower,
	useLiveQuery,
} from "@tanstack/react-db";

export type IssueDoc = Issue;

const issuesCollection = createCollection<IssueDoc>(
	queryCollectionOptions<IssueDoc, string>({
		queryKey: ["issues"],
		queryClient,
		staleTime: Number.POSITIVE_INFINITY,
		queryFn: async () => {
			const { posts } = await adminClient.organization.posts.getDetailedPosts({
				offset: 0,
				take: 100,
				sortBy: "newest",
			});
			return transformServerPostsToIssues(posts);
		},
		getKey: (item) => item.id,
		onUpdate: async ({ transaction }) => {
			const mutation = transaction.mutations[0];
			const changes = mutation.changes as Partial<Issue>;
			// map client changes → server payload
			const toServerPriority = (id: string) =>
				id === "no-priority" ? "no_priority" : (id as any);
			const payload: any = { id: mutation.key as string };
			if (changes.title) payload.title = changes.title;
			if (changes.description) payload.description = changes.description;
			if (changes.statusKey) payload.status = changes.statusKey;
			if (changes.priority)
				payload.priority = toServerPriority(changes.priority.id);
			if (changes.priorityKey) payload.priority = changes.priorityKey;
			if ("assignee" in changes)
				payload.assigneeId = changes.assignee?.id ?? null;
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
				boardId: changes.project?.id ?? "",
				priority:
					changes.priorityKey && changes.priorityKey !== "no-priority"
						? (changes.priorityKey as
								| "no_priority"
								| "low"
								| "medium"
								| "high"
								| "urgent"
								| undefined)
						: "no_priority",
				status: changes.statusKey as
					| "to-do"
					| "in-progress"
					| "completed"
					| "backlog"
					| "technical-review"
					| "paused"
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
			.limit(1),
	);

export const useIssuesByStatus = (statusId: string | undefined) =>
	useLiveQuery((q) =>
		q
			.from({ issue: issuesCollection })
			.where(({ issue }) =>
				issue.statusKey && statusId ? eq(issue.statusKey, statusId) : false,
			),
	);

export const useSearchIssues = (query: string | undefined) => {
	const safe = (query ?? "").trim().toLowerCase();
	return useLiveQuery((q) =>
		q.from({ issue: issuesCollection }).where(({ issue }) => {
			if (!safe) return true;
			const title = lower(issue.title);
			const identifier = lower(issue.identifier);
			return ilike(title, `%${safe}%`) || ilike(identifier, `%${safe}%`);
		}),
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
