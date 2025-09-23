import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { CommentButton, VoteButton } from '@/components/svg';
import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import { Button } from '@/components/ui/button';
import { formatSmartDate } from '@/lib/utils';
import { client } from '@/utils/orpc';

export const Route = createFileRoute('/_public/board/$postId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { postId } = Route.useParams();

  const [commentInput, setCommentInput] = useState('');
  const queryClient = useQueryClient();

  // TODO: Replace useQuery with useInfiniteQuery for comments
  const {
    data: allComments,
    isLoading: isLoadingComments,
    isError: isErrorComments,
  } = useQuery({
    queryKey: [postId, 'comments'],
    queryFn: () => client.public.comments.getAll({ feedbackId: postId }),
  });

  const { data: post, isPending } = useQuery({
    queryKey: [postId, 'post'],
    queryFn: () =>
      client.public.posts.getDetailedSinglePost({ feedbackId: postId }),
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) =>
      client.public.comments.create({ feedbackId: postId, content }),
    onSuccess: () => {
      setCommentInput('');
      queryClient.invalidateQueries({ queryKey: [postId, 'comments'] });
    },
  });

  return (
    <div className="relative flex gap-4 text-card-foreground">
      <div className="w-2xl flex-1 rounded-3xl border-1 border-muted-foreground/10 bg-gradient-to-bl from-card-foreground/5 to-card px-6 shadow-xs">
        <div className={'py-6'}>
          <h4 className="font-semibold text-lg capitalize">{post?.title}</h4>
          <p className="text-pretty font-medium text-accent-foreground/75 text-sm capitalize">
            {post?.content}
          </p>

          <div className="ml-auto flex max-w-max gap-3 pt-6">
            <CommentButton count={post?.commentCount || 0} />
            <VoteButton
              count={post?.voteCount || 0}
              disableFromParent={isPending}
              feedbackId={postId}
              hasVoted={!!post?.hasVoted}
            />
          </div>
          <div>
            <div className="mt-6 flex flex-col items-end gap-3 rounded-2xl border border-muted-foreground/10 bg-muted p-4">
              <AutosizeTextarea
                className="min-h-20 rounded-lg border-none bg-muted"
                minHeight={100}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Add a comment..."
                value={commentInput}
              />
              <Button
                className="ml-auto rounded-lg"
                disabled={!commentInput.trim() || commentMutation.isPending}
                onClick={() => commentMutation.mutate(commentInput)}
              >
                {commentMutation.isPending ? 'Posting...' : 'Comment'}
              </Button>
            </div>
          </div>
        </div>

        {/* Comments loading state */}
        {isLoadingComments && (
          <div className="py-4 text-center">
            <div className="text-gray-500 text-sm">Loading comments...</div>
          </div>
        )}

        {/* Comments error state */}
        {isErrorComments && (
          <div className="py-4 text-center">
            <div className="text-red-500 text-sm">Error loading comments</div>
          </div>
        )}

        {/* Comments list */}
        {allComments?.map((comment, i) => {
          return (
            <div
              className={`flex w-full gap-2 space-y-2 py-4 ${i === allComments?.length - 1 ? 'border-b-0' : 'border-muted-foreground/5 border-b-2'}`}
              key={comment.id}
            >
              <div>
                <img
                  alt="Avatar"
                  className="h-8 w-8 rounded-full"
                  height={32}
                  src={comment.author?.image || 'https://picsum.photos/64'}
                  width={32}
                />
              </div>
              <div className="w-full">
                <div className="flex w-full items-center gap-2">
                  <h4 className="capitalize">
                    {comment.author?.name || 'Anon'}
                  </h4>
                  <span className="ml-1 text-muted-foreground text-xs">
                    ({comment.createdAt && formatSmartDate(comment.createdAt)})
                  </span>
                  <span className="ml-auto">
                    <svg
                      aria-hidden="true"
                      className="text-muted-foreground"
                      fill="none"
                      height={16}
                      viewBox="0 0 24 24"
                      width={16}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="5" cy="12" fill="currentColor" r="1.5" />
                      <circle cx="12" cy="12" fill="currentColor" r="1.5" />
                      <circle cx="19" cy="12" fill="currentColor" r="1.5" />
                    </svg>
                  </span>
                </div>
                <div>
                  <p>{comment.content}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* No comments state */}
        {!isLoadingComments && allComments?.length === 0 && (
          <div className="border-muted-foreground/5 border-t-2 py-4 text-center">
            <div className="text-gray-500 text-sm">
              No comments yet. Be the first to comment!
            </div>
          </div>
        )}
      </div>
      <div className="sticky top-6 flex h-fit flex-col gap-4">
        <div className="z-10 w-3xs rounded-2xl border-1 border-muted-foreground/10 bg-background/90 p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div>
              {post?.author?.image ? (
                <img
                  alt="Author"
                  className="h-8 w-8 rounded-full"
                  height={32}
                  src={post?.author?.image}
                  width={32}
                />
              ) : (
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-stone-300/50 dark:bg-stone-700/50">
                  ?
                </span>
              )}
            </div>
            <div>
              <h4 className="py-1 font-medium text-foreground text-sm capitalize">
                {post?.author?.name || 'Anon'}
              </h4>
              <p className="pl-px text-muted-foreground text-xs">
                {post?.createdAt && formatSmartDate(post?.createdAt)}
              </p>
            </div>
          </div>
          <div>
            {post?.board && (
              <div className="pt-4 pl-px">
                <span className="pr-4 font-medium text-foreground text-sm">
                  Board
                </span>
                <span className="rounded-md bg-green-100 p-1.5 px-2 font-medium text-green-800 text-xs">
                  {post?.board.name}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="z-10 rounded-2xl border-1 border-muted-foreground/10 bg-background/90 p-4 shadow-2xs">
          <h4 className="mb-2 font-medium capitalize">Get Updates</h4>
          <Button
            className="w-full rounded-lg font-medium"
            variant={'secondary'}
          >
            Subscribe
          </Button>
        </div>
      </div>
    </div>
  );
}
