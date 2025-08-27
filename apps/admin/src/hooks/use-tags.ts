import { useTagsStore } from "@/store/tags-store";
import { adminClient } from "@/utils/admin-orpc";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface UseTagsOptions {
	enabled?: boolean;
}

export const useTags = ({ enabled = true }: UseTagsOptions = {}) => {
	const { addTags, getAllTags } = useTagsStore();

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["tags"],
		queryFn: async () => {
			const response = await adminClient.organization.tagsRouter.getAll();
			return response;
		},
		enabled,
		refetchOnWindowFocus: false,
	});

	// Transform and add server data to Zustand store
	useEffect(() => {
		if (data) {
			// Transform server data to include default count
			const transformedTags = data.map((tag) => ({
				...tag,
				// count: tag.count ?? 0,
				count: 0,
			}));
			addTags(transformedTags);
		}
	}, [data, addTags]);

	return {
		data: getAllTags(),
		isLoading,
		error,
		refetch,
	};
};
