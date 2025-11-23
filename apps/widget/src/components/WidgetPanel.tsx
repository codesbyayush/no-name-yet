import type React from 'react';
import { COLORS } from '../constants';
import type { WidgetPanelProps } from '../types';
import {
  getAnimationClasses,
  getContainerStyle,
  getPanelBodyHeightStyle,
  getPanelStyle,
} from '../utils/styles';

/**
 * WidgetPanel - Container for the widget content
 *
 * This component handles:
 * - Positioning (center vs above-button)
 * - Responsive layout (desktop vs mobile)
 * - Open/close animations
 * - Mobile close button
 * - Panel styling and shadows
 *
 * The panel adapts its size and position based on the viewport and configuration.
 * On mobile, it's always full-screen. On desktop, it can be centered or anchored
 * to the bottom-right corner.
 *
 * @param isOpen - Whether the panel is visible
 * @param isClosing - Whether the closing animation is in progress
 * @param isDesktop - Whether viewport is desktop-sized
 * @param position - Widget position setting
 * @param theme - Theme configuration
 * @param children - Panel content
 * @param onClose - Callback to close the panel
 */
const WidgetPanel: React.FC<WidgetPanelProps> = ({
  isOpen,
  isClosing,
  isDesktop,
  position,
  theme,
  children,
  onClose,
}) => {
  if (!isOpen) return null;

  const containerStyle = getContainerStyle(position, isDesktop, theme.zIndex);
  const panelStyle = getPanelStyle(isDesktop, theme, position);
  const panelBodyHeightStyle = getPanelBodyHeightStyle(isDesktop);
  const animationClasses = getAnimationClasses(isClosing, position);

  return (
    <div style={containerStyle}>
      <div className={animationClasses} style={panelStyle}>
        {/* Mobile-only close button overlay */}
        <button
          aria-label='Close'
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 20,
            display: isDesktop ? 'none' : 'flex',
            height: '36px',
            width: '36px',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            color: COLORS.GRAY[700],
            fontSize: '24px',
            lineHeight: 1,
            boxShadow:
              '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(8px)',
            border: 'none',
            cursor: 'pointer',
          }}
          type='button'
        >
          ×
        </button>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            ...panelBodyHeightStyle,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default WidgetPanel;
