import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts';
import { authClient } from '@/lib/auth-client';

export function useTeams() {
  const { session } = useAuth();
  const {
    data: teams,
    isPending,
    error,
  } = useQuery({
    queryKey: ['org-teams', session?.session?.activeOrganizationId],
    queryFn: () =>
      authClient.organization.listTeams({
        query: {
          organizationId: session?.session?.activeOrganizationId ?? '',
        },
      }),
    staleTime: 30_000,
  });

  return {
    teams: teams?.data ?? [],
    isLoading: isPending,
    isError: error,
  };
}
