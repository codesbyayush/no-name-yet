import type React from 'react';
import { DEFAULTS } from '../constants';
import type { WidgetPosition, WidgetTheme } from '../types';

/**
 * Calculates the container styles for the widget panel
 *
 * The container positioning changes based on:
 * - Widget position (center vs above-button)
 * - Viewport size (desktop vs mobile)
 *
 * @param position - Widget position setting
 * @param isDesktop - Whether the viewport is desktop-sized
 * @param zIndex - Custom z-index from theme (optional)
 * @returns React CSS properties for the container
 */
export function getContainerStyle(
  position: WidgetPosition,
  isDesktop: boolean,
  zIndex?: number,
): React.CSSProperties {
  const baseZIndex = zIndex ?? 1_000_001;

  // Center position: Modal-style overlay
  if (position === 'center') {
    return isDesktop
      ? {
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: baseZIndex,
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }
      : {
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: baseZIndex,
          padding: 0,
        };
  }

  // Above-button position: Anchored to bottom-right
  return isDesktop
    ? {
        position: 'fixed',
        top: 'auto',
        right: '20px',
        bottom: '80px',
        left: 'auto',
        zIndex: baseZIndex,
        padding: 0,
        width: '384px',
        maxWidth: 'calc(100vw - 40px)',
      }
    : {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: baseZIndex,
        padding: 0,
      };
}

/**
 * Calculates the panel styles for the widget
 *
 * Panel styling adapts to:
 * - Viewport size (rounded corners on desktop, full-screen on mobile)
 * - Position (max-width constraint for center position)
 * - Theme customization (border radius)
 *
 * @param isDesktop - Whether the viewport is desktop-sized
 * @param theme - Theme configuration
 * @param position - Widget position setting
 * @returns React CSS properties for the panel
 */
export function getPanelStyle(
  isDesktop: boolean,
  theme: WidgetTheme,
  position: WidgetPosition,
): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'white',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  };

  if (isDesktop) {
    return {
      ...baseStyle,
      height: 'auto',
      borderRadius: theme.borderRadius || DEFAULTS.BORDER_RADIUS,
      // Center position gets a max-width constraint
      ...(position === 'center' ? { maxWidth: '512px' } : {}),
    };
  }

  // Mobile: Full-screen, no border radius
  return {
    ...baseStyle,
    height: '100%',
    borderRadius: 0,
  };
}

/**
 * Calculates the panel body height styles
 *
 * @param isDesktop - Whether the viewport is desktop-sized
 * @returns React CSS properties for panel body height
 */
export function getPanelBodyHeightStyle(
  isDesktop: boolean,
): React.CSSProperties {
  return isDesktop
    ? { height: '80vh', maxHeight: '700px' }
    : { height: '100%' };
}

/**
 * Generates animation class names based on widget state
 *
 * Different animations are used for different positions:
 * - Center: zoom in/out
 * - Above-button: grow/shrink from bottom-right
 *
 * @param isClosing - Whether the closing animation is active
 * @param position - Widget position setting
 * @returns CSS class names for animation
 */
export function getAnimationClasses(
  isClosing: boolean,
  position: WidgetPosition,
): string {
  if (position === 'center') {
    return isClosing
      ? 'zoom-out-95 fade-out animate-out duration-200 origin-center'
      : 'zoom-in-95 fade-in animate-in duration-300 origin-center';
  }

  return isClosing
    ? 'shrink-out-br fade-out animate-out duration-200 origin-bottom-right'
    : 'grow-in-br fade-in animate-in duration-300 origin-bottom-right';
}
