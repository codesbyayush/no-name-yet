import React from "react";
import { UpvoteIcon } from "./upvote-icon";
import { cn } from "@/lib/utils";

interface VoteButtonProps {
  count: number;
  isVoted?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const VoteButton: React.FC<VoteButtonProps> = ({
  count,
  isVoted = false,
  onClick,
  disabled = false,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group/accessory flex size-12 flex-col items-center justify-center gap-1 rounded-xl border-2 bg-transparent transition-all duration-300",
        isVoted
          ? "border-primary hover:border-primary/80"
          : "border-gray-300 hover:border-primary dark:border-gray-600 dark:hover:border-primary",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      data-filled={isVoted}
    >
      <UpvoteIcon
        size={16}
        filled={isVoted}
        className={cn(
          "transition-all duration-300",
          isVoted
            ? "fill-primary stroke-primary"
            : "fill-transparent stroke-gray-600 stroke-[1.5] dark:stroke-gray-400",
        )}
      />
      <p
        className={cn(
          "text-sm font-semibold leading-none transition-all duration-300",
          isVoted ? "text-primary" : "text-gray-600 dark:text-gray-400",
        )}
      >
        {count}
      </p>
    </button>
  );
};
