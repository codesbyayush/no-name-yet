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
import { toast } from "sonner";

export type IssueDoc = Issue;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const issuesCollection = createCollection<IssueDoc>(
	queryCollectionOptions<IssueDoc, string>({
		queryKey: ["issues"],
		queryClient,
		staleTime: Number.POSITIVE_INFINITY,
		queryFn: async () => {
			const resp = await adminClient.organization.posts.getDetailedPosts({
				offset: 0,
				take: 100,
				sortBy: "newest",
			});
			const normalized = transformServerPostsToIssues(resp.posts);
			return normalized;
		},
		getKey: (item) => item.id,
		onInsert: async ({ transaction }) => {},
		onUpdate: async ({ transaction }) => {
			const mutation = transaction.mutations[0];
			const changes = mutation.changes as Partial<IssueDoc>;

			const toServerPriority = (
				priorityId: string,
			): "low" | "medium" | "high" | "urgent" | "no_priority" =>
				priorityId === "no-priority"
					? "no_priority"
					: (priorityId as "low" | "medium" | "high" | "urgent");

			const payload: {
				id: string;
				title?: string;
				description?: string;
				statusId?: string;
				priority?: "low" | "medium" | "high" | "urgent" | "no_priority";
				assigneeId?: string;
			} = { id: mutation.key as string };

			if (changes.title) payload.title = changes.title;
			if (changes.description) payload.description = changes.description;
			if (changes.status) payload.statusId = changes.status.id;
			if (changes.priority)
				payload.priority = toServerPriority(changes.priority.id);
			if (changes.assigneeId) payload.assigneeId = changes.assigneeId;
			await adminClient.organization.posts.update(payload);
		},
		onDelete: async ({ transaction }) => {
			const mutation = transaction.mutations[0];
			await adminClient.organization.posts.delete({
				id: mutation.key as string,
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
			.where(({ issue }) => eq(issue.id, id))
			.limit(1),
	);

export const useIssuesByStatus = (statusId: string | undefined) =>
	useLiveQuery((q) =>
		q
			.from({ issue: issuesCollection })
			.where(({ issue }) => eq(issue.status.id, statusId)),
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
