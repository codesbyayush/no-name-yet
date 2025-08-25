import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { client } from "@/utils/orpc";
import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import {
	Calendar,
	Check,
	Circle,
	GitBranch,
	MessageCircle,
	ThumbsDown,
	ThumbsUp,
	User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CommentButton, CommentIcon, MoreDotsIcon, VoteButton } from "../svg";
import { AutosizeTextarea } from "../ui/autosize-textarea";
import { StatusIcon } from "../ui/status-icon";

export function RenderPostsList() {
	// Replace dummy data with infinite query
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
	} = useInfiniteQuery({
		queryKey: ["admin-posts"],
		queryFn: ({ pageParam = 0 }) =>
			client.getOrganizationMemberPosts({ offset: pageParam, take: 10 }),
		getNextPageParam: (lastPage) =>
			lastPage.pagination.hasMore
				? lastPage.pagination.offset + lastPage.pagination.take
				: undefined,
		initialPageParam: 0,
	});

	// Flatten all posts from all pages
	const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

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
					rootMargin: "100px", // Trigger 100px before reaching the element
				},
			);

			if (node) {
				observerRef.current.observe(node);
			}
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
		<div className="space-y-8">
			{isLoading && <div className="py-4 text-center">Loading posts...</div>}
			{isError && (
				<div className="py-4 text-center text-red-500">Error loading posts</div>
			)}

			{/* Linear-style List View */}
			<div>
				<div className="space-y-1">
					{allPosts.map((post, i) => {
						const isSecondLastPost = i === allPosts.length - 2;

						return (
							<div
								key={post.id}
								ref={isSecondLastPost ? lastPostCallback : null}
							>
								<PostListItem post={post} />
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
			</div>
		</div>
	);
}

function PostDetail({ post }: { post: any }) {
	const postId = post.id;
	const [commentText, setCommentText] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
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

	// Mutation for creating comments
	const createCommentMutation = useMutation({
		mutationFn: (content: string) =>
			client.publicCreateComment({
				feedbackId: postId,
				content,
				isInternal: false,
			}),
		onSuccess: () => {
			// Clear the comment text
			setCommentText("");
			// Invalidate and refetch comments
			queryClient.invalidateQueries({ queryKey: [postId, "comments"] });
		},
		onError: (error) => {
			// You could add a toast notification here
		},
	});

	// Handle comment submission
	const handleSubmitComment = async () => {
		if (!commentText.trim()) {
			return;
		}

		setIsSubmitting(true);
		try {
			await createCommentMutation.mutateAsync(commentText.trim());
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle Enter key press in textarea
	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmitComment();
		}
	};

	// Flatten all comments from all pages
	const allComments = data?.pages.flatMap((page) => page.comments) ?? [];

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

	return (
		<div className="relative flex gap-4 text-card-foreground">
			<div className="w-5xl flex-1 rounded-3xl border-1 border-muted-foreground/10 bg-gradient-to-bl from-card-foreground/5 to-card px-6 shadow-xs">
				<div className={"space-y-2 py-6"}>
					<h4 className="font-semibold text-card-foreground text-lg capitalize">
						{post?.title}
					</h4>
					<p className="text-pretty font-medium text-muted-foreground text-sm capitalize">
						{post?.content}
					</p>

					<div className="ml-auto flex max-w-max gap-3 pt-6">
						<CommentButton count={allComments.length} disabled />
						<VoteButton count={28} hasVoted={false} desableFromParent={true} />
					</div>
				</div>

				<div className="mt-6 flex flex-col items-end gap-3 rounded-2xl border border-muted-foreground/10 bg-muted p-4">
					<AutosizeTextarea
						className="!bg-muted min-h-20 rounded-xl border-muted-foreground/20 border-none px-4 py-3 text-base text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
						minHeight={100}
						placeholder="Add a comment..."
						value={commentText}
						onChange={(e) => setCommentText(e.target.value)}
						onKeyDown={handleKeyPress}
						disabled={isSubmitting}
					/>
					<Button
						className="ml-auto h-10 rounded-xl bg-primary px-6 text-base shadow-lg hover:bg-primary/90"
						onClick={handleSubmitComment}
						disabled={!commentText.trim() || isSubmitting}
					>
						{isSubmitting ? "Posting..." : "Comment"}
					</Button>
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
									<h4>
										{comment.isAnonymous
											? comment.anonymousName || "Anonymous"
											: comment.author?.name}
									</h4>
									<span>
										{new Date(comment.createdAt).toLocaleDateString()}
									</span>
									<span className="ml-auto">
										<MoreDotsIcon size={16} className="text-muted-foreground" />
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
			<div className="sticky flex h-fit flex-col gap-4 ">
				<div className="z-10 w-3xs rounded-2xl border-1 border-muted-foreground/10 bg-background/90 bg-noise p-4 shadow-2xs">
					<div className="flex items-center gap-3">
						<div>
							{post?.author?.image ? (
								<img
									src={post?.author?.image}
									alt="Avatar"
									className="h-8 rounded-full"
								/>
							) : (
								<span className="rounded-full bg-gray-800">A</span>
							)}
						</div>
						<div>
							<h4 className="py-1 font-medium text-sm capitalize">
								{" "}
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
								<span className="pr-4 font-medium text-sm">Board</span>
								<span className="rounded-md bg-green-100 p-1.5 px-2 font-medium text-green-800 text-xs">
									{" "}
									{post?.board.name}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

// Linear-style list item component
function PostListItem({ post }: { post: any }) {
	const [isChecked, setIsChecked] = useState(false);

	// Generate random progress for demo (in real app, this would come from post data)
	const progress = Math.floor(Math.random() * 10) + 1;
	const total = Math.floor(Math.random() * 10) + 1;

	// Generate random status colors for demo
	const statusColors = [
		"bg-blue-500",
		"bg-red-500",
		"bg-green-500",
		"bg-yellow-500",
		"bg-gray-400",
	];
	const statusColor =
		statusColors[Math.floor(Math.random() * statusColors.length)];

	// Generate random tags for demo
	const tags = [
		{ name: "Improvement", color: "bg-orange-500" },
		{ name: "Prod Bugs", color: "bg-red-500" },
		{ name: "Tech Bugs", color: "bg-red-500" },
		{ name: "New Feature", color: "bg-blue-500" },
		{ name: "Bug Fix", color: "bg-purple-500" },
	];
	const randomTags = tags.slice(0, Math.floor(Math.random() * 3) + 1);

	// Generate random user initials for demo
	const userInitials = ["NKC", "SK", "AB", "CD", "EF"];
	const userInitial = post?.author?.name?.slice(0, 2);

	return (
		<Sheet>
			<SheetTrigger asChild>
				<div className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50">
					{/* Checkbox */}
					<div className="flex h-4 w-4 items-center justify-center">
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								setIsChecked(!isChecked);
							}}
							className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-colors ${
								isChecked
									? "border-blue-500 bg-blue-500"
									: "border-muted-foreground/30 hover:border-muted-foreground/50"
							}`}
						>
							{isChecked && <Check className="h-3 w-3 text-white" />}
						</button>
					</div>

					{/* Status Indicator */}
					<div className="flex h-4 w-4 items-center justify-center">
						<div className={`h-3 w-3 rounded-full ${statusColor}`} />
					</div>

					{/* Task Description */}
					<div className="min-w-0 flex-1">
						<span className="block truncate font-medium text-foreground text-sm">
							{post.title}
						</span>
						{post.issueKey && (
							<span className="text-muted-foreground text-xs">
								{post.issueKey}
							</span>
						)}
					</div>

					{/* Tags */}
					<div className="flex items-center gap-1">
						{randomTags.map((tag, index) => (
							<div
								key={`${tag.name}-${index}`}
								className="flex items-center gap-1 rounded-md bg-muted/50 px-2 py-1 text-xs"
							>
								<div className={`h-2 w-2 rounded-full ${tag.color}`} />
								<span className="text-muted-foreground">{tag.name}</span>
							</div>
						))}
					</div>

					{/* Tags */}
					<div className="flex items-center gap-1">
						<div className="flex items-center gap-1 rounded-md bg-muted/50 px-2 py-1 text-xs">
							<div className={`h-2 w-2 rounded-full ${post.board?.color}`} />
							<span className="text-muted-foreground">{post.board?.icon}</span>
							<span className="text-muted-foreground">{post.board?.name}</span>
						</div>
					</div>

					{/* Assigned User */}
					<div className="flex h-6 w-6 items-center justify-center">
						<div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
							{post.author?.image ? (
								<img
									src={post.author?.image}
									alt="Avatar"
									className="h-6 rounded-full"
								/>
							) : (
								<span className=" font-medium text-muted-foreground text-xs uppercase">
									{userInitial || "?"}
								</span>
							)}
						</div>
					</div>

					{/* Date */}
					<div className="min-w-[40px] text-right text-muted-foreground text-xs">
						{new Date(post.createdAt).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
						})}
					</div>

					<CommentButton
						count={1}
						disabled
						iconSize={8}
						className="size-8 flex-row border-none"
					/>
					<button
						onClick={(e) => {
							e.stopPropagation();
							const branch = post.issueKey
								? `${String(post.issueKey).toLowerCase()}`
								: "";
							if (branch) navigator.clipboard.writeText(branch);
						}}
						className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted/50"
						title="Copy branch"
					>
						<GitBranch className="h-4 w-4" />
					</button>

					<VoteButton
						count={28}
						hasVoted={false}
						desableFromParent={true}
						iconSize={16}
						className="size-8 w-10 flex-row items-center gap-1 border-none"
					/>
				</div>
			</SheetTrigger>
			<SheetContent className="m-4 h-[calc(100vh-2rem)] w-[90%] max-w-[90%] overflow-y-auto rounded-3xl border-1 border-muted-foreground/10 bg-card p-6 shadow-xl sm:max-w-[600px] md:w-[700px] lg:w-[1000px] lg:max-w-[1000px]">
				<PostDetail post={post} />
			</SheetContent>
		</Sheet>
	);
}
