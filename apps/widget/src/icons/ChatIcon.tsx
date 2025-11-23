import type React from 'react';

export const ChatIcon: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className, style }) => (
  <svg
    aria-hidden='true'
    className={className}
    fill='none'
    focusable='false'
    height='20'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='2'
    style={style}
    viewBox='0 0 24 24'
    width='20'
  >
    <path d='M21 14a4 4 0 0 1-4 4H9l-4 4v-4H5a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v7Z' />
    <path d='M12 8v5' />
    <path d='M9.5 10.5H14.5' />
  </svg>
);
