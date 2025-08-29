import { adminClient } from "@/utils/admin-orpc";
import { queryClient } from "@/utils/orpc";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection, eq, useLiveQuery } from "@tanstack/react-db";
import type { Tag as ServerTag } from "server/types";

export type TagDoc = Pick<ServerTag, "id" | "name" | "color">;

const tagsCollection = createCollection<TagDoc>(
	queryCollectionOptions<TagDoc, string>({
		queryKey: ["tags"],
		queryClient,
		staleTime: Number.POSITIVE_INFINITY,
		queryFn: async () => {
			const rows = await adminClient.organization.tagsRouter.getAll();
			return rows as TagDoc[];
		},
		getKey: (item) => item.id,
	}),
);

export const useTags = () =>
	useLiveQuery((q) => q.from({ tag: tagsCollection }));

export const useTagById = (id: string | undefined) =>
	useLiveQuery((q) =>
		q
			.from({ tag: tagsCollection })
			.where(({ tag }) => (id ? eq(tag.id, id) : false))
			.limit(1),
	);

export const tags = tagsCollection;
