import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Separator } from '@workspace/ui/components/separator';
import { format } from 'date-fns';
import { Inbox } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';
import { useTeams } from '@/features/auth/hooks/useTeams';
import { RequestComments } from '@/features/requests/components/request-comments';
import { RequestSidebar } from '@/features/requests/components/request-sidebar';
import {
  useDeleteIssue,
  useIssueById,
  useUpdateIssue,
} from '@/react-db/issues';
import { DetailsPageShell } from '@/shared/components/details-page-shell';
import {
  PageLoadingState,
  PageNotFoundState,
} from '@/shared/components/page-states';
import { adminClient } from '@/utils/admin-orpc';

export const Route = createFileRoute('/_admin/requests/$requestId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { requestId } = Route.useParams();
  const navigate = useNavigate();
  const { data: request, isLoading } = useIssueById(requestId);
  const { teams } = useTeams();
  const { session } = useAuth();
  const { mutate: updateIssue } = useUpdateIssue();
  const { mutate: deleteIssue } = useDeleteIssue();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePromote = async (issueId: string) => {
    setIsProcessing(true);
    try {
      const promotedPost = await adminClient.organization.posts.promote({
        id: issueId,
      });
      if (promotedPost) {
        updateIssue(promotedPost.id, {
          id: promotedPost.id,
          issueKey: promotedPost.issueKey ?? undefined,
          status: 'to-do',
        });
        toast.success('Request promoted to issues');
        navigate({ to: '/requests' });
      }
    } catch {
      toast.error('Failed to promote request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDiscard = async (issueId: string) => {
    setIsProcessing(true);
    try {
      const discardedPost = await adminClient.organization.posts.discard({
        id: issueId,
      });
      if (discardedPost) {
        deleteIssue(discardedPost.id);
        toast.success('Request discarded');
        navigate({ to: '/requests' });
      }
    } catch {
      toast.error('Failed to discard request');
    } finally {
      setIsProcessing(false);
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
    return (
      <PageLoadingState
        title='Loading request...'
        subtitle='Fetching request details'
      />
    );
  }

  if (!request?.[0]) {
    return (
      <PageNotFoundState
        icon={Inbox}
        title='Request not found'
        subtitle='This request may have been promoted or discarded'
        backLink={{ to: '/requests', label: 'Back to Requests' }}
      />
    );
  }

  const currentRequest = request[0];
  const createdDate = currentRequest.createdAt
    ? format(new Date(currentRequest.createdAt), 'MMMM dd, yyyy')
    : null;

  return (
    <DetailsPageShell
      backLink={{ to: '/requests', label: 'Requests' }}
      headerRight={
        <>
          <div className='flex size-5 items-center justify-center rounded bg-amber-500/10'>
            <Inbox className='size-3 text-amber-500' />
          </div>
          <span className='text-muted-foreground text-xs'>Pending Review</span>
        </>
      }
      sidebar={
        <RequestSidebar
          request={currentRequest}
          getPublicUrl={getPublicUrl}
          handlePromote={handlePromote}
          handleDiscard={handleDiscard}
          isProcessing={isProcessing}
        />
      }
    >
      <div className='mx-auto max-w-3xl px-6 py-8'>
        {/* Title */}
        <h1 className='font-bold text-2xl leading-tight'>
          {currentRequest.title || 'Untitled Request'}
        </h1>

        {/* Meta info */}
        {createdDate && (
          <p className='mt-2 text-muted-foreground text-sm'>
            Submitted on {createdDate}
          </p>
        )}

        {/* Description */}
        <div className='mt-6'>
          <div className='prose prose-sm max-w-none dark:prose-invert'>
            {currentRequest.description ? (
              <p className='whitespace-pre-wrap text-foreground/90 leading-relaxed'>
                {currentRequest.description}
              </p>
            ) : (
              <p className='italic text-muted-foreground'>
                No description provided
              </p>
            )}
          </div>
        </div>

        {/* Separator */}
        <Separator className='my-8' />

        {/* Comments Section */}
        <RequestComments requestId={requestId} />
      </div>
    </DetailsPageShell>
  );
}
