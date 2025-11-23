import type React from 'react';
import type { IconProps } from '../types';

/**
 * AskIcon - Chat bubble icon for the "Ask" tab
 *
 * Represents the feedback submission feature.
 * Uses a chat bubble with lines to suggest conversation/communication.
 *
 * @param className - CSS class for styling
 * @param style - Inline styles
 */
const AskIcon: React.FC<IconProps> = ({ className, style }) => (
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
    {/* Chat bubble */}
    <path d='M4 5H20V17H8L4 21V5Z' />
    {/* Three lines representing text */}
    <path d='M7 9H17' />
    <path d='M7 12H15' />
  </svg>
);

export default AskIcon;
