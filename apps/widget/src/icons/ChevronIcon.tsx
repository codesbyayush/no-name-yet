import type React from 'react';

export const ChevronIcon: React.FC<{
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
    <path d='M6 9L12 15L18 9' />
  </svg>
);
