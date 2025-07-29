import { CreateEditPost } from "@/components/create-edit-post";
import { CommentButton, VoteButton } from "@/components/svg";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import { client } from "@/utils/orpc";
import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/_public/board/$postId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { postId } = Route.useParams();

	const [commentInput, setCommentInput] = useState("");
	const queryClient = useQueryClient();

	// Replace useQuery with useInfiniteQuery for comments
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: isLoadingComments,
		isError: isErrorComments,
	} = useInfiniteQuery({
		queryKey: [postId, "comments"],
		queryFn: ({ pageParam = 0 }) =>
			client.getPostComments({ postId: postId, offset: pageParam, take: 10 }),
		getNextPageParam: (lastPage) =>
			lastPage.pagination.hasMore
				? lastPage.pagination.offset + lastPage.pagination.take
				: undefined,
		initialPageParam: 0,
	});

	// Flatten all comments from all pages
	const allComments = data?.pages.flatMap((page) => page.comments) ?? [];

	const { data: post } = useQuery({
		queryKey: [postId, "post"],
		queryFn: () =>
			client.mixed
				.getDetailedSinglePost({ feedbackId: postId })
				.then((data) => data.post),
	});

	// Intersection Observer for infinite scroll
	const observerRef = useRef<IntersectionObserver | null>(null);

	const lastCommentCallback = useCallback(
		(node: HTMLDivElement | null) => {
			if (isLoadingComments) {
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
					rootMargin: "100px", // Trigger 100px before reaching the element
				},
			);

			if (node) {
				observerRef.current.observe(node);
			}
		},
		[isLoadingComments, hasNextPage, fetchNextPage, isFetchingNextPage],
	);

	useEffect(() => {
		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, []);
	const commentMutation = useMutation({
		mutationFn: (content: string) =>
			client.public.comments.create({ feedbackId: postId, content }),
		onSuccess: () => {
			setCommentInput("");
			queryClient.invalidateQueries({ queryKey: [postId, "comments"] });
		},
	});

	return (
		<div className="relative flex gap-4 text-card-foreground ">
			<div className="w-2xl flex-1 rounded-3xl border-1 border-muted-foreground/10 bg-gradient-to-bl from-card-foreground/5 to-card px-6 shadow-xs">
				<div className={"py-6"}>
					<h4 className="font-semibold text-lg capitalize">{post?.title}</h4>
					<p className="text-pretty font-medium text-accent-foreground/75 text-sm capitalize">
						{post?.content}
					</p>

					<div className="ml-auto flex max-w-max gap-3 pt-6">
						<CommentButton count={post?.totalComments || 0} />
						<VoteButton
							count={post?.totalVotes || 0}
							hasVoted={post?.hasVoted}
							feedbackId={postId}
						/>
					</div>
					<div>
						<div className="mt-6 flex flex-col items-end gap-3 rounded-2xl border border-muted-foreground/10 bg-muted p-4">
							<AutosizeTextarea
								className="min-h-20 rounded-lg border-none bg-muted"
								minHeight={100}
								placeholder="Add a comment..."
								value={commentInput}
								onChange={(e) => setCommentInput(e.target.value)}
							/>
							<Button
								className="ml-auto rounded-lg"
								onClick={() => commentMutation.mutate(commentInput)}
								disabled={!commentInput.trim() || commentMutation.isPending}
							>
								{commentMutation.isPending ? "Posting..." : "Comment"}
							</Button>
						</div>
					</div>
				</div>

				{/* Comments loading state */}
				{isLoadingComments && allComments.length === 0 && (
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
				{allComments.map((comment, i) => {
					const isSecondLastComment = i === allComments.length - 2;

					return (
						<div
							key={comment.id}
							ref={isSecondLastComment ? lastCommentCallback : null}
							className={`flex w-full gap-1 space-y-2 py-4 ${i === allComments.length - 1 ? "border-b-0" : "border-muted-foreground/5 border-b-2"}`}
						>
							<div>
								<img
									src={comment.author?.image || "https://picsum.photos/64"}
									alt="Avatar"
									className="h-8 w-8 rounded-full"
								/>
							</div>
							<div className="w-full">
								<div className="flex w-full gap-2">
									<h4>{comment.author?.name}</h4>
									<span>{comment.createdAt.toLocaleDateString()}</span>
									<span className="ml-auto">
										<svg
											width={16}
											height={16}
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											className="text-muted-foreground"
										>
											<circle cx="5" cy="12" r="1.5" fill="currentColor" />
											<circle cx="12" cy="12" r="1.5" fill="currentColor" />
											<circle cx="19" cy="12" r="1.5" fill="currentColor" />
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

				{/* Loading indicator for next page of comments */}
				{isFetchingNextPage && (
					<div className="border-muted-foreground/5 border-t-2 py-4 text-center">
						<div className="text-gray-500 text-sm">
							Loading more comments...
						</div>
					</div>
				)}

				{/* No comments state */}
				{!isLoadingComments && allComments.length === 0 && (
					<div className="border-muted-foreground/5 border-t-2 py-4 text-center">
						<div className="text-gray-500 text-sm">
							No comments yet. Be the first to comment!
						</div>
					</div>
				)}
			</div>
			<div className="sticky top-6 flex h-fit flex-col gap-4 ">
				<div className="z-10 w-3xs rounded-2xl border-1 border-muted-foreground/10 bg-background/90 bg-noise p-4 shadow-2xs">
					<div className="flex items-center gap-3">
						<div>
							{post?.author?.image ? (
								<img src={post?.author?.image} className="h-8 rounded-full" />
							) : (
								<span className="rounded-full bg-gray-800">A</span>
							)}
						</div>
						<div>
							<h4 className="py-1 font-medium text-foreground text-sm capitalize">
								{post?.author?.name}
							</h4>
							<p className="pl-px text-muted-foreground text-xs">
								{post?.createdAt.toLocaleDateString()}
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
				<div className="z-10 rounded-2xl border-1 border-muted-foreground/10 bg-background/90 bg-noise p-4 shadow-2xs">
					<h4 className="mb-2 font-medium capitalize">Get Updates</h4>
					<Button
						variant={"secondary"}
						className="w-full rounded-lg font-medium"
					>
						Subscribe
					</Button>
				</div>
			</div>
		</div>
	);
}
