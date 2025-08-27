import { status } from "@/mock-data/status";
import { useStatusesStore } from "@/store/status-store";
import { adminClient } from "@/utils/admin-orpc";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface UseStatusesOptions {
	enabled?: boolean;
}

export const useStatuses = ({ enabled = true }: UseStatusesOptions = {}) => {
	const { addStatuses, getAllStatuses } = useStatusesStore();

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["statuses"],
		queryFn: async () => {
			const response = await adminClient.organization.status.getAll();
			return response;
		},
		staleTime: Number.POSITIVE_INFINITY,
		enabled,
	});

	useEffect(() => {
		if (data) {
			addStatuses(
				data.map((temp) => ({
					...temp,
					icon: status.find((s) => s.key === temp.key)?.icon || status[0].icon,
					color: temp.color || status[0].color,
				})),
			);
		}
	}, [data, addStatuses]);

	return {
		data: getAllStatuses(),
		isLoading,
		error,
		refetch,
	};
};
