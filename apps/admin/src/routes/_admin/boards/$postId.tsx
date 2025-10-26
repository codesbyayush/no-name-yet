import { createFileRoute } from '@tanstack/react-router';
import { PostSidebar } from '@/components/issues/post-sidebar';
import { useIssueById } from '@/react-db/issues';

export const Route = createFileRoute('/_admin/boards/$postId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { postId } = Route.useParams();

  const { data: post } = useIssueById(postId);

  if (!post?.[0]) {
    return <div>No post found</div>;
  }

  return (
    <div className='flex h-full w-full bg-muted/10'>
      <div className='max-h-svh flex-1 overflow-x-hidden overflow-y-scroll text-wrap'>
        <div className='w-full px-6 py-8'>
          <div className='space-y-4'>
            <h1 className='font-bold text-2xl'>{post[0].title}</h1>
            <div className='prose prose-sm max-w-none'>
              <p className='whitespace-pre-wrap text-muted-foreground'>
                {post[0].description}
              </p>
            </div>
            <div className='rounded-lg bg-muted/50 p-4'>
              <pre className='whitespace-pre-wrap break-all text-sm'>
                {JSON.stringify(post?.[0], null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
      <PostSidebar issue={post[0]} />
    </div>
  );
}
