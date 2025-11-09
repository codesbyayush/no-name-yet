import { TooltipProvider } from '@workspace/ui/components/tooltip';
import { useAuth } from '@/features/auth';
import { useTeams } from '@/features/auth/hooks/useTeams';
import {
  useDeleteIssue,
  useExternalPendingIssues,
  useUpdateIssue,
} from '@/react-db/issues';
import { adminClient } from '@/utils/admin-orpc';
import { RequestLine } from './request-line';

export function RequestIssues() {
  const { data: externalPendingIssues, isLoading } = useExternalPendingIssues();
  const { teams } = useTeams();
  const { session } = useAuth();
  const { mutate: updateIssue } = useUpdateIssue();
  const { mutate: deleteIssue } = useDeleteIssue();

  const handlePromote = async (issueId: string) => {
    const promotedPost = await adminClient.organization.posts.promote({
      id: issueId,
    });
    if (promotedPost) {
      updateIssue(promotedPost.id, {
        id: promotedPost.id,
        issueKey: promotedPost.issueKey ?? undefined,
        status: 'to-do',
      });
    }
  };

  const handleDiscard = async (issueId: string) => {
    const discardedPost = await adminClient.organization.posts.discard({
      id: issueId,
    });
    if (discardedPost) {
      deleteIssue(discardedPost.id);
    }
  };

  const getPublicUrl = (issueId: string) => {
    const activeTeam = teams.find(
      (team) => team.id === session?.session.activeTeamId,
    );

    const publicBaseUrl = window.location.origin.replace(
      'app.',
      `${activeTeam?.name}.`,
    );
    return `${publicBaseUrl}/board/${issueId}`;
  };

  if (isLoading) {
    return <LoadingRequests />;
  }

  if (externalPendingIssues?.length === 0) {
    return <EmptyRequests />;
  }

  return (
    <TooltipProvider>
      <div className='p-6'>
        <div className='space-y-3'>
          {externalPendingIssues?.map((issue) => {
            return (
              <RequestLine
                key={issue.id}
                issue={issue}
                getPublicUrl={getPublicUrl}
                handlePromote={handlePromote}
                handleDiscard={handleDiscard}
              />
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}

function LoadingRequests() {
  return (
    <div className='flex h-full items-center justify-center'>
      <div className='text-center'>
        <h3 className='text-lg font-semibold'>Loading...</h3>
      </div>
    </div>
  );
}

function EmptyRequests() {
  return (
    <div className='flex h-full items-center justify-center'>
      <div className='text-center'>
        <h3 className='text-lg font-semibold'>Requested issues are empty</h3>
        <p className='text-muted-foreground mt-2'>
          New requests from the public portal will appear here
        </p>
      </div>
    </div>
  );
}
