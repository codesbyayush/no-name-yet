import { cn } from "@/lib/utils";
import { client } from "@/utils/orpc";
import { queryClient } from "@/utils/orpc";
import { useMutation } from "@tanstack/react-query";
import type React from "react";
import { toast } from "sonner";
import { UpvoteIcon } from "./upvote-icon";

interface VoteButtonProps {
	count: number;
	feedbackId?: string;
	hasVoted?: boolean;
	disableFromParent?: boolean;
	iconSize?: number;
	className?: string;
}

export const VoteButton: React.FC<VoteButtonProps> = ({
	count,
	feedbackId,
	hasVoted = false,
	disableFromParent = false,
	className = "",
}) => {
	const handleVote = (e: React.MouseEvent) => {
		e.stopPropagation();

		if (!feedbackId) {
			return;
		}

		if (hasVoted) {
			deleteVoteMutation.mutate({ feedbackId });
		} else {
			createVoteMutation.mutate({ feedbackId });
		}
	};

	const createVoteMutation = useMutation({
		mutationFn: ({ feedbackId }: { feedbackId: string }) =>
			client.public.votes.create({ feedbackId }),
		onMutate: async ({ feedbackId }) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: ["all-posts"] });

			// Snapshot the previous value
			const previousPosts = queryClient.getQueryData(["all-posts"]);

			// Optimistically update the posts data
			queryClient.setQueryData(["all-posts"], (old: any) => {
				if (!old?.pages) {
					return old;
				}

				return {
					...old,
					pages: old.pages.map((page: any) => ({
						...page,
						posts: page.posts.map((post: any) => {
							if (post.id === feedbackId) {
								return {
									...post,
									hasVoted: true,
									voteCount: post.voteCount + 1,
								};
							}
							return post;
						}),
					})),
				};
			});

			// Return a context object with the snapshotted value
			return { previousPosts };
		},
		onError: (err, variables, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousPosts) {
				queryClient.setQueryData(["all-posts"], context.previousPosts);
			}
			toast.error("Failed to vote");
		},
	});

	const deleteVoteMutation = useMutation({
		mutationFn: ({ feedbackId }: { feedbackId: string }) =>
			client.public.votes.delete({ feedbackId }),
		onMutate: async ({ feedbackId }) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: ["all-posts"] });

			// Snapshot the previous value
			const previousPosts = queryClient.getQueryData(["all-posts"]);

			// Optimistically update the posts data
			queryClient.setQueryData(["all-posts"], (old: any) => {
				if (!old?.pages) {
					return old;
				}

				return {
					...old,
					pages: old.pages.map((page: any) => ({
						...page,
						posts: page.posts.map((post: any) => {
							if (post.id === feedbackId) {
								return {
									...post,
									hasVoted: false,
									voteCount: Math.max(0, post.voteCount - 1),
								};
							}
							return post;
						}),
					})),
				};
			});

			// Return a context object with the snapshotted value
			return { previousPosts };
		},
		onError: (err, variables, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousPosts) {
				queryClient.setQueryData(["all-posts"], context.previousPosts);
			}
			toast.error("Failed to remove vote");
		},
	});

	const disabled =
		createVoteMutation.isPending ||
		deleteVoteMutation.isPending ||
		disableFromParent;

	return (
		<button
			type="button"
			onClick={handleVote}
			disabled={disabled}
			className={cn(
				"group/accessory flex size-12 flex-col items-center justify-center gap-1 rounded-xl border-2 bg-transparent transition-all duration-300",
				hasVoted
					? "border-primary hover:border-primary/80"
					: "border-gray-300 hover:border-primary dark:border-gray-600 dark:hover:border-primary",
				disabled && "cursor-not-allowed opacity-50",
				className,
			)}
			data-filled={hasVoted}
		>
			<UpvoteIcon
				size={16}
				filled={hasVoted}
				className={cn(
					"transition-all duration-300",
					hasVoted
						? "fill-primary stroke-primary"
						: "fill-transparent stroke-[1.5] stroke-gray-600 dark:stroke-gray-400",
				)}
			/>
			<p
				className={cn(
					"font-semibold text-sm leading-none transition-all duration-300",
					hasVoted ? "text-primary" : "text-gray-600 dark:text-gray-400",
				)}
			>
				{count}
			</p>
		</button>
	);
};
