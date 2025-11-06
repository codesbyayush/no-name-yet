import type React from 'react';

interface CommentIconProps {
  className?: string;
  size?: number;
}

export const CommentIcon: React.FC<CommentIconProps> = ({
  className = '',
  size = 16,
}) => (
  <svg
    className={className}
    fill='none'
    height={size}
    viewBox='0 0 24 24'
    width={size}
    xmlns='http://www.w3.org/2000/svg'
    role='img'
    aria-label='Comment Icon'
  >
    <path
      d='M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
    />
  </svg>
);
