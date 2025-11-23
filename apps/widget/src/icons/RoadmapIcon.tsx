import type React from 'react';
import type { IconProps } from '../types';

/**
 * RoadmapIcon - Folded map icon for the "Roadmap" tab
 *
 * Represents the product roadmap feature.
 * Uses a folded map icon to suggest planning and future direction.
 *
 * @param className - CSS class for styling
 * @param style - Inline styles
 */
const RoadmapIcon: React.FC<IconProps> = ({ className, style }) => (
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
    {/* Folded map shape */}
    <path d='M9 4L15 6L21 4V18L15 20L9 18L3 20V6L9 4Z' />
    {/* Fold lines */}
    <path d='M9 4V18' />
    <path d='M15 6V20' />
  </svg>
);

export default RoadmapIcon;
