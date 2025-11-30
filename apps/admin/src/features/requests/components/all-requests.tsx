import { TooltipProvider } from '@workspace/ui/components/tooltip';
import { Inbox, Package } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';
import { useTeams } from '@/features/auth/hooks/useTeams';
import {
  useDeleteIssue,
  useExternalPendingIssues,
  useUpdateIssue,
} from '@/react-db/issues';
import { PageEmptyState } from '@/shared/components';
import { useRequestStore } from '@/store/request-store';
import { adminClient } from '@/utils/admin-orpc';
import { RequestLine } from './request-line';

export function AllRequests() {
  const { data: externalPendingIssues, isLoading } = useExternalPendingIssues();
  const { teams } = useTeams();
  const { session } = useAuth();
  const { mutate: updateIssue } = useUpdateIssue();
  const { mutate: deleteIssue } = useDeleteIssue();
  const { sortBy, searchQuery } = useRequestStore();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handlePromote = async (issueId: string) => {
    setProcessingId(issueId);
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
      }
    } catch {
      toast.error('Failed to promote request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDiscard = async (issueId: string) => {
    setProcessingId(issueId);
    try {
      const discardedPost = await adminClient.organization.posts.discard({
        id: issueId,
      });
      if (discardedPost) {
        deleteIssue(discardedPost.id);
        toast.success('Request discarded');
      }
    } catch {
      toast.error('Failed to discard request');
    } finally {
      setProcessingId(null);
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

  // Filter and sort requests
  const filteredAndSortedRequests = useMemo(() => {
    if (!externalPendingIssues) return [];

    let filtered = externalPendingIssues;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (issue) =>
          issue.title?.toLowerCase().includes(query) ||
          issue.description?.toLowerCase().includes(query),
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 'votes':
          // When vote count is available from server, use it here
          // For now, sort by date as fallback
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'newest':
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    return sorted;
  }, [externalPendingIssues, sortBy, searchQuery]);

  if (isLoading) {
    return <LoadingRequests />;
  }

  if (!externalPendingIssues || externalPendingIssues.length === 0) {
    return (
      <PageEmptyState
        icon={Inbox}
        iconClassName='size-8 text-amber-500/70'
        title='No pending requests'
        subtitle='New requests from the public portal will appear here for your review'
      />
    );
  }

  if (filteredAndSortedRequests.length === 0 && searchQuery.trim()) {
    return (
      <PageEmptyState
        icon={Package}
        title='No results found'
        subtitle={`No requests match "${searchQuery}". Try a different search term.`}
      />
    );
  }

  return (
    <TooltipProvider>
      <div className='h-full w-full'>
        {/* Request list */}
        <div className='divide-y-0'>
          <AnimatePresence mode='popLayout'>
            {filteredAndSortedRequests.map((issue) => (
              <RequestLine
                key={issue.id}
                issue={issue}
                getPublicUrl={getPublicUrl}
                handlePromote={handlePromote}
                handleDiscard={handleDiscard}
                isProcessing={processingId === issue.id}
                isAnyProcessing={processingId !== null}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </TooltipProvider>
  );
}

function LoadingRequests() {
  return (
    <div className='flex h-full flex-col items-center justify-center gap-4'>
      <div className='flex size-12 items-center justify-center rounded-2xl bg-muted/50'>
        <div className='size-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent' />
      </div>
      <div className='text-center'>
        <h3 className='font-medium text-foreground text-sm'>
          Loading requests...
        </h3>
        <p className='mt-1 text-muted-foreground text-xs'>
          Fetching pending feedback
        </p>
      </div>
    </div>
  );
}
