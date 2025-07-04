import { Button } from "@/components/ui/button";
import { getFeedbacks } from "@/lib/utils";
import { client } from "@/utils/orpc";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { CreateEditPost } from "@/components/create-edit-post";
import { VoteButton, CommentButton } from "@/components/svg";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_public/board/")({
  component: BoardIndexPage,
});

function BoardIndexPage() {
  const AllFeedbacks = getFeedbacks();
  const navigate = useNavigate({ from: "/board" });
  const queryClient = useQueryClient();

  // Replace useQuery with useInfiniteQuery for posts
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["all-posts"],
    queryFn: ({ pageParam = 0 }) =>
      client.mixed.getDetailedPosts({ offset: pageParam, take: 10 }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore
        ? lastPage.pagination.offset + lastPage.pagination.take
        : undefined,
    initialPageParam: 0,
  });

  // Flatten all posts from all pages
  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  // Fetch vote status for each post
  const postIds = allPosts.map((post) => post.id);
  const voteQueries = useQuery({
    queryKey: ["user-votes", postIds],
    queryFn: async () => {
      const voteStatuses = await Promise.all(
        postIds.map(async (postId) => {
          try {
            const hasVoted = await client.public.votes.get({
              feedbackId: postId,
            });
            return { postId, hasVoted };
          } catch (error) {
            return { postId, hasVoted: false };
          }
        }),
      );
      return voteStatuses.reduce(
        (acc, { postId, hasVoted }) => {
          acc[postId] = hasVoted;
          return acc;
        },
        {} as Record<string, boolean>,
      );
    },
    enabled: postIds.length > 0,
  });

  const userVotes = voteQueries.data || {};

  const [position, setPosition] = useState("bottom");

  // Vote mutations
  const createVoteMutation = useMutation({
    mutationFn: ({ feedbackId }: { feedbackId: string }) =>
      client.public.votes.create({ feedbackId }),
    onSuccess: () => {
      toast.success("Vote added!");
      // Invalidate posts to refresh vote counts
      queryClient.invalidateQueries({ queryKey: ["all-posts"] });
      // Invalidate user votes to update vote status
      queryClient.invalidateQueries({ queryKey: ["user-votes"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to vote");
    },
  });

  const deleteVoteMutation = useMutation({
    mutationFn: ({ feedbackId }: { feedbackId: string }) =>
      client.public.votes.delete({ feedbackId }),
    onSuccess: () => {
      toast.success("Vote removed!");
      // Invalidate posts to refresh vote counts
      queryClient.invalidateQueries({ queryKey: ["all-posts"] });
      // Invalidate user votes to update vote status
      queryClient.invalidateQueries({ queryKey: ["user-votes"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove vote");
    },
  });

  const handleVote = (feedbackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const hasVoted = userVotes[feedbackId];

    if (hasVoted) {
      deleteVoteMutation.mutate({ feedbackId });
    } else {
      createVoteMutation.mutate({ feedbackId });
    }
  };

  const handleCommentClick = (feedbackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({ to: feedbackId });
  };

  const { data: boards } = useQuery({
    queryKey: ["public-boards"],
    queryFn: () => client.getAllPublicBoards(),
  });

  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  const lastPostCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        {
          rootMargin: "100px", // Trigger 100px before reaching the element
        },
      );

      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasNextPage, fetchNextPage, isFetchingNextPage],
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
      <div className="flex gap-4 relative">
        <div className="border-1 border-muted-foreground/10 bg-gradient-to-bl rounded-3xl to-card from-card-foreground/5 w-2xl shadow-xs flex-1">
          {isLoading && <div>Loading posts...</div>}
          {isError && <div>Error loading posts</div>}
          {allPosts.map((f, i) => {
            const isLastPost = i === allPosts.length - 1;
            const isSecondLastPost = i === allPosts.length - 2;

            return (
              <div
                key={f.id}
                ref={isSecondLastPost ? lastPostCallback : null}
                onClick={() =>
                  navigate({
                    to: f.id,
                  })
                }
                className={`${i > 0 ? "border-t-[1px] border-muted-foreground/5" : ""} p-6 space-y-1 cursor-pointer`}
              >
                <div className="justify-between flex gap-3 items-center">
                  <div>
                    <h4 className="font-semibold text-card-foreground capitalize text-lg">
                      {f.title}
                    </h4>
                    <p className="text-sm text-muted-foreground font-medium capitalize text-pretty">
                      {f.content}
                    </p>
                  </div>
                  <div className="flex gap-3 items-center justify-end">
                    <div>In</div>
                    <CommentButton
                      count={f.comments || 0}
                      onClick={(e) => handleCommentClick(f.id, e)}
                    />
                    <VoteButton
                      count={f.votes || 0}
                      isVoted={userVotes[f.id] || false}
                      disabled={
                        createVoteMutation.isPending ||
                        deleteVoteMutation.isPending ||
                        voteQueries.isLoading
                      }
                      onClick={(e) => handleVote(f.id, e)}
                    />
                  </div>
                </div>
                <div className="pt-4 flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <div>
                      {f.author?.image ? (
                        <img
                          src={f.author?.image || "https://picsum/64"}
                          className="h-8 rounded-full"
                        />
                      ) : (
                        <p className="size-8 rounded-full bg-red-900 flex items-center justify-center text-white">
                          A
                        </p>
                      )}
                    </div>
                    <div>
                      <h5 className="capitalize font-medium text-sm pb-0.5">
                        {f.author?.name || "Anon"}
                      </h5>
                      <p className="capitalize text-xs text-muted-foreground font-medium">
                        {f.updatedAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div>Feedback</div>
                  </div>
                  <div>In Progress</div>
                </div>
              </div>
            );
          })}

          {/* Loading indicator for next page */}
          {isFetchingNextPage && (
            <div className="py-4 text-center">
              <div className="text-sm text-gray-500">Loading more posts...</div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 sticky top-6 h-fit ">
          <div className="border-1 bg-card bg-noise z-10 rounded-2xl  border-muted-foreground/10 shadow-2xs p-4 w-3xs">
            <h4 className="font-medium capitalize mb-2"> Got an idea?</h4>
            <CreateEditPost
              boardId={boards?.boards[0].id || ""} // TODO: Get actual board ID from context
              mode="create"
              onSuccess={() => {
                // Refresh the posts list
                window.location.reload(); // Temporary until we have proper invalidation
              }}
            />
          </div>
          <div className="border-1 bg-background/90 rounded-2xl bg-noise z-10  border-muted-foreground/10 shadow-2xs p-4 w-3xs">
            <h4 className="font-medium capitalize mb-2">boards</h4>
            <div>
              {boards?.boards.map((board) => (
                <Button
                  key={board.id}
                  variant={"secondary"}
                  className="w-full  text-foreground text-left p-0 font-medium"
                >
                  <span className="size-4 bg-green-500 rounded-full" />
                  <span>{board.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
