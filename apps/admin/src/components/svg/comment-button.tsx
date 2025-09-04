import type React from 'react';
import { cn } from '@/lib/utils';
import { CommentIcon } from './comment-icon';

interface CommentButtonProps {
  count: number;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  iconSize?: number;
}

export const CommentButton: React.FC<CommentButtonProps> = ({
  count,
  onClick,
  disabled = false,
  className = '',
  iconSize = 16,
}) => {
  return (
    <button
      className={cn(
        'group/accessory flex size-12 flex-col items-center justify-center gap-1 rounded-xl border-2 bg-transparent transition-all duration-300',
        'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <CommentIcon
        className={cn(
          'transition-all duration-300',
          'stroke-gray-600 dark:stroke-gray-400'
        )}
        size={16}
      />
      <p
        className={cn(
          'font-semibold text-sm leading-none transition-all duration-300',
          'text-gray-600 dark:text-gray-400'
        )}
      >
        {count}
      </p>
    </button>
  );
};
