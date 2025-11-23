import type React from 'react';
import type { IconProps } from '../types';

/**
 * ChangelogIcon - Newspaper icon for the "Changelog" tab
 *
 * Represents the changelog/updates feature.
 * Uses a newspaper icon to suggest news and updates.
 *
 * @param className - CSS class for styling
 * @param style - Inline styles
 */
const ChangelogIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg
    aria-hidden='true'
    className={className}
    fill='none'
    focusable='false'
    height='20'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth={2}
    style={style}
    viewBox='0 0 24 24'
    width='20'
  >
    {/* Newspaper shape */}
    <rect height='16' rx='2' width='18' x='3' y='4' />
    {/* Text lines */}
    <path d='M7 8H16' />
    <path d='M7 12H17' />
    <path d='M7 16H13' />
  </svg>
);

export default ChangelogIcon;
