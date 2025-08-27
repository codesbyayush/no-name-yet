import { useUsersStore } from "@/store/users-store";
import { adminClient } from "@/utils/admin-orpc";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface UseUsersOptions {
	enabled?: boolean;
	limit?: number;
	offset?: number;
}

export const useUsers = ({
	enabled = true,
	limit = 100,
	offset = 0,
}: UseUsersOptions = {}) => {
	const { addUsers, users } = useUsersStore();

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["users", limit, offset],
		queryFn: async () => {
			const response =
				await adminClient.organization.users.getOrganizationUsers({
					limit,
					offset,
				});
			return response;
		},
		enabled,
		refetchOnWindowFocus: false,
		staleTime: Number.POSITIVE_INFINITY,
	});

	useEffect(() => {
		if (data?.users) {
			addUsers(data.users);
		}
	}, [data, addUsers]);

	return {
		data,
		isLoading,
		error,
		refetch,
		users,
	};
};
