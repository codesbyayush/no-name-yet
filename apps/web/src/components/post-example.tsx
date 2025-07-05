import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { client } from "../utils/orpc";
import { CommentButton, CommentIcon, UpvoteIcon, VoteButton } from "./svg";
import { AutosizeTextarea } from "./ui/autosize-textarea";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

interface PostExampleProps {
	boardId: string;
}

export function PostExample({ boardId }: PostExampleProps) {
	const queryClient = useQueryClient();
	const [isCreatingPost, setIsCreatingPost] = useState(false);
	const [postForm, setPostForm] = useState({
		title: "",
		description: "",
		type: "suggestion" as "bug" | "suggestion",
		priority: "medium" as "low" | "medium" | "high",
	});

	// Fetch posts for the board
	const { data: postsData, isLoading } = useQuery({
		queryKey: ["boardPosts", boardId],
		queryFn: () => client.getBoardPosts({ boardId, offset: 0, take: 10 }),
		enabled: !!boardId,
	});

	// Create post mutation
	const createPostMutation = useMutation({
		mutationFn: (data: typeof postForm) =>
			client.createPost({
				boardId,
				...data,
				tags: [],
				isAnonymous: false,
				attachments: [],
			}),
		onSuccess: () => {
			toast.success("Post created successfully!");
			queryClient.invalidateQueries({ queryKey: ["boardPosts", boardId] });
			setPostForm({
				title: "",
				description: "",
				type: "suggestion",
				priority: "medium",
			});
			setIsCreatingPost(false);
		},
		onError: (error: any) => {
			toast.error(error.message || "Failed to create post");
		},
	});

	// Comment mutation
	const createCommentMutation = useMutation({
		mutationFn: ({
			feedbackId,
			content,
		}: {
			feedbackId: string;
			content: string;
		}) =>
			client.createComment({
				feedbackId,
				content,
				isInternal: false,
			}),
		onSuccess: () => {
			toast.success("Comment added successfully!");
			queryClient.invalidateQueries({ queryKey: ["postComments"] });
		},
		onError: (error: any) => {
			toast.error(error.message || "Failed to add comment");
		},
	});

	// Vote mutation
	const voteMutation = useMutation({
		mutationFn: ({
			feedbackId,
			type,
		}: {
			feedbackId: string;
			type: "upvote" | "downvote";
		}) =>
			client.voteOnPost({
				feedbackId,
				type,
				weight: 1,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["boardPosts", boardId] });
		},
		onError: (error: any) => {
			toast.error(error.message || "Failed to vote");
		},
	});

	const handleCreatePost = () => {
		if (!postForm.title.trim() || !postForm.description.trim()) {
			toast.error("Please fill in all required fields");
			return;
		}
		createPostMutation.mutate(postForm);
	};

	const handleVote = (feedbackId: string, type: "upvote" | "downvote") => {
		voteMutation.mutate({ feedbackId, type });
	};

	if (isLoading) {
		return <div>Loading posts...</div>;
	}

	return (
		<div className="space-y-6">
			{/* Post Creation Form */}
			<Card>
				<CardHeader>
					<CardTitle>Create New Post</CardTitle>
				</CardHeader>
				<CardContent>
					{!isCreatingPost ? (
						<Button onClick={() => setIsCreatingPost(true)}>Create Post</Button>
					) : (
						<div className="space-y-4">
							<div>
								<label className="mb-2 block font-medium text-sm">Title</label>
								<Input
									value={postForm.title}
									onChange={(e) =>
										setPostForm((prev) => ({ ...prev, title: e.target.value }))
									}
									placeholder="Enter post title..."
									maxLength={200}
								/>
							</div>

							<div>
								<label className="mb-2 block font-medium text-sm">
									Description
								</label>
								<AutosizeTextarea
									value={postForm.description}
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										setPostForm((prev) => ({
											...prev,
											description: e.target.value,
										}))
									}
									placeholder="Describe your feedback..."
									maxLength={5000}
								/>
							</div>

							<div className="flex gap-4">
								<div>
									<label className="mb-2 block font-medium text-sm">Type</label>
									<select
										value={postForm.type}
										onChange={(e) =>
											setPostForm((prev) => ({
												...prev,
												type: e.target.value as "bug" | "suggestion",
											}))
										}
										className="rounded border px-3 py-2"
									>
										<option value="suggestion">Suggestion</option>
										<option value="bug">Bug Report</option>
									</select>
								</div>

								<div>
									<label className="mb-2 block font-medium text-sm">
										Priority
									</label>
									<select
										value={postForm.priority}
										onChange={(e) =>
											setPostForm((prev) => ({
												...prev,
												priority: e.target.value as "low" | "medium" | "high",
											}))
										}
										className="rounded border px-3 py-2"
									>
										<option value="low">Low</option>
										<option value="medium">Medium</option>
										<option value="high">High</option>
									</select>
								</div>
							</div>

							<div className="flex gap-2">
								<Button
									onClick={handleCreatePost}
									disabled={createPostMutation.isPending}
								>
									{createPostMutation.isPending ? "Creating..." : "Create Post"}
								</Button>
								<Button
									variant="outline"
									onClick={() => setIsCreatingPost(false)}
								>
									Cancel
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Posts List */}
			<div className="space-y-4">
				<h2 className="font-semibold text-xl">Posts</h2>
				{postsData?.posts?.map((post: any) => (
					<PostCard
						key={post.id}
						post={post}
						onVote={handleVote}
						onComment={createCommentMutation.mutate}
					/>
				))}
			</div>
		</div>
	);
}

interface PostCardProps {
	post: any;
	onVote: (feedbackId: string, type: "upvote" | "downvote") => void;
	onComment: (params: { feedbackId: string; content: string }) => void;
}

function PostCard({ post, onVote, onComment }: PostCardProps) {
	const [showCommentForm, setShowCommentForm] = useState(false);
	const [commentContent, setCommentContent] = useState("");

	// Fetch comments for this post
	const { data: commentsData } = useQuery({
		queryKey: ["postComments", post.id],
		queryFn: () =>
			client.getPostCommentsWithReplies({
				feedbackId: post.id,
				offset: 0,
				take: 5,
			}),
		enabled: showCommentForm,
	});

	const handleAddComment = () => {
		if (!commentContent.trim()) return;

		onComment({
			feedbackId: post.id,
			content: commentContent,
		});
		setCommentContent("");
		setShowCommentForm(false);
	};

	return (
		<Card>
			<CardContent className="pt-6">
				<div className="space-y-4">
					{/* Post Header */}
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<h3 className="font-semibold text-lg">{post.title}</h3>
							<p className="mt-2 text-gray-600">{post.description}</p>
						</div>
						<div className="flex gap-2">
							<Badge variant={post.type === "bug" ? "destructive" : "default"}>
								{post.type}
							</Badge>
							<Badge variant="outline">{post.priority}</Badge>
						</div>
					</div>

					{/* Post Stats */}
					<div className="flex items-center gap-4 text-gray-500 text-sm">
						<span className="flex items-center gap-1">
							<UpvoteIcon size={14} className="text-gray-500" />
							{post.stats?.upvotes || 0}
						</span>
						<span className="flex items-center gap-1">
							<UpvoteIcon size={14} className="rotate-180 text-gray-500" />
							{post.stats?.downvotes || 0}
						</span>
						<span className="flex items-center gap-1">
							<CommentIcon size={14} className="text-gray-500" />
							{post.stats?.comments || 0}
						</span>
						<span>By {post.author?.name || "Anonymous"}</span>
						<span>{new Date(post.createdAt).toLocaleDateString()}</span>
					</div>

					{/* Actions */}
					<div className="flex gap-2">
						<VoteButton
							count={post.stats?.upvotes || 0}
							isVoted={false}
							onClick={() => onVote(post.id, "upvote")}
						/>
						<Button
							variant="outline"
							size="sm"
							onClick={() => onVote(post.id, "downvote")}
						>
							👎 Downvote
						</Button>
						<CommentButton
							count={post.stats?.comments || 0}
							onClick={() => setShowCommentForm(!showCommentForm)}
						/>
					</div>

					{/* Comment Form */}
					{showCommentForm && (
						<div className="space-y-2 border-t pt-4">
							<AutosizeTextarea
								value={commentContent}
								onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
									setCommentContent(e.target.value)
								}
								placeholder="Add a comment..."
								maxLength={2000}
							/>
							<div className="flex gap-2">
								<Button size="sm" onClick={handleAddComment}>
									Add Comment
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowCommentForm(false)}
								>
									Cancel
								</Button>
							</div>
						</div>
					)}

					{/* Comments List */}
					{commentsData?.comments && commentsData.comments.length > 0 && (
						<div className="space-y-3 border-t pt-4">
							<h4 className="font-medium">Comments</h4>
							{commentsData.comments.map((comment: any) => (
								<CommentCard key={comment.id} comment={comment} />
							))}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

interface CommentCardProps {
	comment: any;
}

function CommentCard({ comment }: CommentCardProps) {
	return (
		<div className="space-y-2 rounded-lg bg-gray-50 p-3">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<p className="text-sm">{comment.content}</p>
				</div>
				<div className="flex gap-2 text-gray-500 text-xs">
					<span className="flex items-center gap-1">
						<UpvoteIcon size={12} className="text-gray-500" />
						{comment.stats?.upvotes || 0}
					</span>
					<span className="flex items-center gap-1">
						<UpvoteIcon size={12} className="rotate-180 text-gray-500" />
						{comment.stats?.downvotes || 0}
					</span>
				</div>
			</div>

			<div className="flex items-center justify-between text-gray-500 text-xs">
				<span>By {comment.author?.name || "Anonymous"}</span>
				<span>{new Date(comment.createdAt).toLocaleDateString()}</span>
			</div>

			{/* Replies */}
			{comment.replies && comment.replies.length > 0 && (
				<div className="ml-4 space-y-2">
					{comment.replies.map((reply: any) => (
						<div key={reply.id} className="rounded bg-white p-2 text-sm">
							<p>{reply.content}</p>
							<div className="mt-1 text-gray-500 text-xs">
								By {reply.author?.name || "Anonymous"} •{" "}
								{new Date(reply.createdAt).toLocaleDateString()}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
