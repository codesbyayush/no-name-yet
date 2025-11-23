import type React from 'react';
import { DEFAULTS, Z_INDEX } from '../constants';
import type { FloatingActionButtonProps } from '../types';

/**
 * FloatingActionButton - Main widget toggle button
 *
 * Uses inline event handlers for hover/focus effects to avoid
 * CSS conflicts with the host page.
 */
const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  isOpen,
  isOpening,
  isClosing,
  theme,
  onClick,
}) => {
  const chatIconAnimClass = (() => {
    if (isOpening) return 'fab-icon-out';
    if (isOpen && isClosing) return 'fab-icon-in';
    if (isOpen) return 'opacity-0';
    return 'opacity-100';
  })();

  const chevronIconAnimClass = (() => {
    if (isOpening) return 'fab-icon-in';
    if (isOpen && isClosing) return 'fab-icon-out';
    if (isOpen) return 'opacity-100';
    return 'opacity-0';
  })();

  return (
    <button
      aria-label={isOpen ? 'Close feedback widget' : 'Open feedback widget'}
      onClick={onClick}
      onFocus={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.9)';
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow =
          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow =
          '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      style={{
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        zIndex: Z_INDEX.FAB,
        display: 'flex',
        height: '44px',
        width: '44px',
        cursor: 'pointer',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.borderRadius || DEFAULTS.BORDER_RADIUS,
        border: 'none',
        boxShadow:
          '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s ease',
        backgroundColor: theme.primaryColor || DEFAULTS.PRIMARY_COLOR,
        overflow: 'visible',
      }}
      type='button'
    >
      <span
        style={{
          position: 'relative',
          display: 'flex',
          height: '20px',
          width: '20px',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        {/* Message circle icon (closed state) */}
        <svg
          aria-hidden='true'
          className={chatIconAnimClass}
          fill='none'
          focusable='false'
          height='22'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          viewBox='0 0 24 24'
          width='22'
        >
          <path d='M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' />
        </svg>

        {/* Chevron down icon (open state) */}
        <svg
          aria-hidden='true'
          className={chevronIconAnimClass}
          fill='none'
          focusable='false'
          height='20'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          viewBox='0 0 24 24'
          width='20'
        >
          <path d='M6 9L12 15L18 9' />
        </svg>
      </span>
    </button>
  );
};

export default FloatingActionButton;
