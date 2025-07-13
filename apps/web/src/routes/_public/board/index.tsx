import { CreateEditPost } from "@/components/create-edit-post";
import { CommentButton, VoteButton } from "@/components/svg";
import { Button } from "@/components/ui/button";
import { getFeedbacks } from "@/lib/utils";
import { client } from "@/utils/orpc";
import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCallback, useEffect, useRef, useState } from "react";
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

	const [position, setPosition] = useState("bottom");

	// Vote mutations
	const createVoteMutation = useMutation({
		mutationFn: ({ feedbackId }: { feedbackId: string }) =>
			client.public.votes.create({ feedbackId }),
		onSuccess: () => {
			toast.success("Vote added!");
			// Invalidate posts to refresh vote counts and vote status
			queryClient.invalidateQueries({ queryKey: ["all-posts"] });
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
			// Invalidate posts to refresh vote counts and vote status
			queryClient.invalidateQueries({ queryKey: ["all-posts"] });
		},
		onError: (error: any) => {
			toast.error(error.message || "Failed to remove vote");
		},
	});

	const handleVote = (
		feedbackId: string,
		hasVoted: boolean,
		e: React.MouseEvent,
	) => {
		e.stopPropagation();

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
			<div className="relative flex gap-4">
				<div className="w-2xl flex-1 rounded-3xl border-1 border-muted-foreground/10 bg-gradient-to-bl from-card-foreground/5 to-card shadow-xs">
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
								className={`${i > 0 ? "border-muted-foreground/5 border-t-[1px]" : ""} cursor-pointer space-y-1 p-6`}
							>
								<div className="flex items-center justify-between gap-3">
									<div>
										<h4 className="font-semibold text-card-foreground text-lg capitalize">
											{f.title}
										</h4>
										<p className="text-pretty font-medium text-muted-foreground text-sm capitalize">
											{f.content}
										</p>
									</div>
									<div className="flex items-center justify-end gap-3">
										<CommentButton
											count={f.comments || 0}
											onClick={(e) => handleCommentClick(f.id, e)}
										/>
										<VoteButton
											count={f.votes || 0}
											isVoted={f.hasVoted || false}
											disabled={
												createVoteMutation.isPending ||
												deleteVoteMutation.isPending
											}
											onClick={(e) => handleVote(f.id, f.hasVoted || false, e)}
										/>
									</div>
								</div>
								<div className="flex items-center justify-between pt-4">
									<div className="flex items-center gap-3">
										<div>
											{f.author?.image ? (
												<img
													src={f.author?.image || "https://picsum/64"}
													className="h-7 rounded-full"
												/>
											) : (
												<p className="flex size-7 items-center justify-center rounded-full bg-red-900 text-white">
													A
												</p>
											)}
										</div>
										<div className="flex items-center gap-3 self-end pt-px">
											<h5 className="pb-0.5 font-medium text-sm capitalize">
												{f.author?.name || "Anon"}
											</h5>
											<p className="font-medium text-muted-foreground text-xs capitalize">
												{f.updatedAt.toLocaleDateString()}
											</p>
										</div>
									</div>
									<div>
										<Badge variant="secondary" className="px-3 capitalize">
											{f.board?.name}
										</Badge>
										<Badge
											variant={
												f.status === "InProgress"
													? "inprogress"
													: f.status === "Completed"
														? "completed"
														: "secondary"
											}
											className="ml-3 px-3 capitalize"
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
				<div className="sticky top-6 flex h-fit flex-col gap-4 ">
					<div className="z-10 w-3xs rounded-3xl border-1 border-muted-foreground/10 bg-gradient-to-bl from-card-foreground/5 to-card p-4 shadow-xs">
						<h4 className="mb-2 font-medium capitalize"> Got an idea?</h4>
						<CreateEditPost
							boardId={boards?.boards[0].id || ""} // TODO: Get actual board ID from context
							mode="create"
							onSuccess={() => {
								// Refresh the posts list
								window.location.reload(); // Temporary until we have proper invalidation
							}}
						/>
					</div>
					<div className="z-10 w-3xs rounded-3xl border-1 border-muted-foreground/10 bg-gradient-to-bl from-card-foreground/5 to-card p-4 shadow-xs">
						<h4 className="mb-2 font-medium capitalize">boards</h4>
						<div className="flex flex-col gap-2">
							{boards?.boards.map((board) => (
								<Button
									key={board.id}
									variant={"secondary"}
									className="h-auto w-full justify-start p-3 text-left font-medium text-foreground"
								>
									<p className="flex items-center gap-2 whitespace-break-spaces capitalize">
										{board.symbol}
										<span className="break-words text-left capitalize">
											{board.name}
										</span>
									</p>
								</Button>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
