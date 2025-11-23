import type React from 'react';

export const CloseIcon: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className, style }) => (
  <svg
    aria-hidden='true'
    className={className}
    fill='none'
    focusable='false'
    height='24'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='2'
    style={style}
    viewBox='0 0 24 24'
    width='24'
  >
    <path d='M18 6L6 18' />
    <path d='M6 6l12 12' />
  </svg>
);
