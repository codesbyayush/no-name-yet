import { createFileRoute } from '@tanstack/react-router';
import { LayoutGrid } from 'lucide-react';
import { ActivityHistory } from '@/features/issues/components/activity-history';
import { PostSidebar } from '@/features/issues/components/post-sidebar';
import { useIssueById } from '@/react-db/issues';
import { DetailsPageShell } from '@/shared/components/details-page-shell';
import {
  PageLoadingState,
  PageNotFoundState,
} from '@/shared/components/page-states';

export const Route = createFileRoute('/_admin/boards/$postId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { postId } = Route.useParams();
  const { data: post, isLoading } = useIssueById(postId);

  if (isLoading) {
    return (
      <PageLoadingState
        title='Loading issue...'
        subtitle='Fetching issue details'
      />
    );
  }

  if (!post?.[0]) {
    return (
      <PageNotFoundState
        icon={LayoutGrid}
        title='Issue not found'
        subtitle='This issue may have been deleted or moved'
        backLink={{ to: '/boards', label: 'Back to Issues' }}
      />
    );
  }

  const currentIssue = post[0];

  return (
    <DetailsPageShell
      backLink={{ to: '/boards', label: 'Issues' }}
      headerRight={
        currentIssue.issueKey && (
          <span className='font-medium text-muted-foreground text-xs uppercase'>
            {currentIssue.issueKey}
          </span>
        )
      }
      sidebar={<PostSidebar issue={currentIssue} />}
    >
      <div className='w-full px-6 py-8'>
        <div className='space-y-4'>
          <h1 className='font-bold text-2xl'>{currentIssue.title}</h1>
          <div className='prose prose-sm max-w-none'>
            <p className='whitespace-pre-wrap text-muted-foreground'>
              {currentIssue.description}
            </p>
          </div>
          <ActivityHistory feedbackId={postId} />
        </div>
      </div>
    </DetailsPageShell>
  );
}
