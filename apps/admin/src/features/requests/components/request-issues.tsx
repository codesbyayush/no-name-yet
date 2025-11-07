import { TooltipProvider } from '@workspace/ui/components/tooltip';
import { useAuth } from '@/features/auth';
import { useTeams } from '@/features/auth/hooks/useTeams';
import { useExternalPendingIssues } from '@/react-db/issues';
import { RequestLine } from './request-line';

export function RequestIssues() {
  const { data: externalPendingIssues, isLoading } = useExternalPendingIssues();
  const { teams } = useTeams();
  const { session } = useAuth();

  const handlePromote = (issueId: string) => {
    // TODO: Implement promote functionality
    console.log('Promote issue:', issueId);
  };

  const handleDiscard = (issueId: string) => {
    // TODO: Implement discard functionality
    console.log('Discard issue:', issueId);
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
          New feedback from the public portal will appear here
        </p>
      </div>
    </div>
  );
}
