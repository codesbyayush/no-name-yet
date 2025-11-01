import { useQuery } from '@tanstack/react-query';
import { adminClient } from '@/utils/admin-orpc';
import { useAuth } from './useAuth';

export default function useTeamMembers() {
  const { session } = useAuth();
  const {
    data: teamUsers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['teamUsers', session?.session.activeTeamId],
    queryFn: () => adminClient.organization.teams.getTeamMembers(),
  });

  return { teamUsers, isLoading, error };
}
