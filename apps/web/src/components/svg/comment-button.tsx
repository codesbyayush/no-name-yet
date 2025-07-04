import React from "react";
import { CommentIcon } from "./comment-icon";
import { cn } from "@/lib/utils";

interface CommentButtonProps {
  count: number;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const CommentButton: React.FC<CommentButtonProps> = ({
  count,
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
        "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <CommentIcon
        size={16}
        className={cn(
          "transition-all duration-300",
          "stroke-gray-600 dark:stroke-gray-400",
        )}
      />
      <p
        className={cn(
          "text-sm font-semibold leading-none transition-all duration-300",
          "text-gray-600 dark:text-gray-400",
        )}
      >
        {count}
      </p>
    </button>
  );
};
