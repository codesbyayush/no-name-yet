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
	desableFromParent?: boolean;
	iconSize?: number;
	className?: string;
}

export const VoteButton: React.FC<VoteButtonProps> = ({
	count,
	feedbackId,
	hasVoted = false,
	desableFromParent = false,
	iconSize = 16,
	className = "",
}) => {
	const handleVote = (e: React.MouseEvent) => {
		e.stopPropagation();

		if (hasVoted) {
			deleteVoteMutation.mutate({ feedbackId });
		} else {
			createVoteMutation.mutate({ feedbackId });
		}
	};

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

	const disabled =
		createVoteMutation.isPending ||
		deleteVoteMutation.isPending ||
		desableFromParent;

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
				size={iconSize}
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
