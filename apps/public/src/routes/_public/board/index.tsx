import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useRef } from 'react';
import { CreateNewIssue } from '@/components/issue/create-new-issue';
import { BoardSkeleton, FeedbackSkeleton } from '@/components/loading';
import { CommentButton, VoteButton } from '@/components/svg';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatSmartDate } from '@/lib/utils';
import { client } from '@/utils/orpc';

export const Route = createFileRoute('/_public/board/')({
  component: BoardIndexPage,
  validateSearch: (search?: Record<string, unknown>) => ({
    board: search?.board as string | undefined,
  }),
});

function BoardIndexPage() {
  const navigate = useNavigate({ from: '/board' });
  const search = Route.useSearch();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['all-posts', search.board],
    queryFn: ({ pageParam = 0 }) =>
      client.public.posts.getDetailedPosts({
        offset: pageParam,
        take: 10,
        ...(search.board && { boardId: search.board }),
      }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore
        ? lastPage.pagination.offset + lastPage.pagination.take
        : undefined,
    initialPageParam: 0,
  });

  // Flatten all posts from all pages
  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  const handleCommentClick = (
    feedbackId: string,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    navigate({ to: feedbackId });
  };

  const { data: boards } = useQuery({
    queryKey: ['public-boards'],
    queryFn: () => client.public.boards.getAll(),
  });

  const handleBoardClick = (boardId: string) => {
    if (search.board === boardId) {
      navigate({
        search: { board: undefined },
        replace: false,
      });
    } else {
      navigate({
        search: { board: boardId },
        replace: false,
      });
    }
  };

  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastPostCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) {
        return;
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        {
          rootMargin: '100px', // Trigger 100px before reaching the element
        }
      );

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [isLoading, hasNextPage, fetchNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="text-card-foreground">
      <div className="relative flex gap-4">
        <div className="w-2xl flex-1 rounded-3xl border-1 border-muted-foreground/10 bg-gradient-to-bl from-card-foreground/5 to-card shadow-xs">
          {isLoading && (
            <div>
              {Array.from({ length: 5 }, (_, i) => ({
                id: `skeleton-${i}`,
                index: i,
              })).map(({ id, index }) => (
                <div
                  className={
                    index > 0 ? 'border-muted-foreground/5 border-t-[1px]' : ''
                  }
                  key={id}
                >
                  <FeedbackSkeleton />
                </div>
              ))}
            </div>
          )}
          {isError && <div>Error loading posts</div>}
          {!isLoading &&
            allPosts.map((f, i) => {
              const _isLastPost = i === allPosts.length - 1;
              const isSecondLastPost = i === allPosts.length - 2;

              return (
                <div
                  className={`${i > 0 ? 'border-muted-foreground/5 border-t-[1px]' : ''} cursor-pointer space-y-1 p-6`}
                  key={f.id}
                  onClick={() =>
                    navigate({
                      to: f.id,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate({
                        to: f.id,
                      });
                    }
                  }}
                  ref={isSecondLastPost ? lastPostCallback : null}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="line-clamp-2 font-semibold text-card-foreground text-lg capitalize">
                        {f.title}
                      </h4>
                      <p className="line-clamp-2 text-pretty font-medium text-muted-foreground text-sm capitalize">
                        {f.content}
                      </p>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <CommentButton
                        count={f.commentCount || 0}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                          handleCommentClick(f.id, e)
                        }
                      />
                      <VoteButton
                        boardId={search.board}
                        count={f.voteCount || 0}
                        feedbackId={f.id}
                        hasVoted={f.hasVoted}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-3">
                      <div>
                        {f.author?.image ? (
                          <img
                            alt="author"
                            className="h-7 w-7 rounded-full"
                            height={28}
                            src={f.author?.image || 'https://picsum/64'}
                            width={28}
                          />
                        ) : (
                          <p className="flex size-7 items-center justify-center rounded-full bg-red-900/30 text-white">
                            ?
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 self-end pt-px">
                        <h5 className="pb-0.5 font-medium text-sm capitalize">
                          {f.author?.name || 'Anon'}
                        </h5>
                        <p className="font-medium text-muted-foreground text-xs">
                          {formatSmartDate(f.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Badge className="px-3 capitalize" variant="secondary">
                        {f.board?.name}
                      </Badge>
                      <Badge
                        className="ml-3 px-3 capitalize"
                        variant={
                          f.status === 'in-progress'
                            ? 'inprogress'
                            : f.status === 'completed'
                              ? 'completed'
                              : 'secondary'
                        }
                      >
                        {f.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Loading indicator for next page */}
          {isFetchingNextPage && (
            <div className="py-4 text-center">
              <div className="text-gray-500 text-sm">Loading more posts...</div>
            </div>
          )}
        </div>
        <div className="sticky top-6 flex h-fit flex-col gap-4">
          <div className="z-10 flex w-3xs items-center gap-1 rounded-3xl border-1 border-muted-foreground/10 bg-gradient-to-bl from-card-foreground/5 to-card p-3.5 shadow-xs">
            <h4 className="flex-1 font-medium capitalize"> Got an idea?</h4>
            <CreateNewIssue />
          </div>
          <div className="z-10 w-3xs rounded-3xl border-1 border-muted-foreground/10 bg-gradient-to-bl from-card-foreground/5 to-card p-3.5 shadow-xs">
            <h4 className="mb-2 font-medium capitalize">boards</h4>
            <div className="flex flex-col gap-2">
              {boards
                ? boards.boards.map((board) => {
                    const isActive = search.board === board.id;
                    return (
                      <Button
                        className="h-10 w-full rounded-xl p-0 font-medium text-base shadow-sm hover:bg-primary/90"
                        key={board.id}
                        onClick={() => handleBoardClick(board.id)}
                        variant={isActive ? 'default' : 'secondary'}
                      >
                        <p className="flex items-center gap-2 whitespace-break-spaces capitalize">
                          {/* {board.symbol} */}
                          <span className="break-words text-left capitalize">
                            {board.name}
                          </span>
                        </p>
                      </Button>
                    );
                  })
                : Array.from({ length: 2 }, (_, i) => ({
                    id: `board-skeleton-${i}`,
                  })).map(({ id }) => (
                    <div
                      className="h-auto w-full justify-start p-1 text-left font-medium text-foreground"
                      key={id}
                    >
                      <BoardSkeleton />
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
