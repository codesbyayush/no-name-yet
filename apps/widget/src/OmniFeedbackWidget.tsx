import type React from 'react';
import { useState } from 'react';
import BottomNavigation from './components/BottomNavigation';
import FloatingActionButton from './components/FloatingActionButton';
import IframeTab from './components/TabContent/IframeTab';
import SubmitTab from './components/TabContent/SubmitTab';
import WidgetPanel from './components/WidgetPanel';
import { DEFAULTS } from './constants';
import { useAnimationState } from './hooks/useAnimationState';
import { useResponsive } from './hooks/useResponsive';
import type { TabType, WidgetProps } from './types';

/**
 * OmniFeedbackWidget - Embeddable feedback widget
 *
 * Provides three features:
 * - Feedback submission (Ask tab)
 * - Product roadmap viewing (Roadmap tab)
 * - Changelog viewing (Changelog tab)
 *
 * Uses inline styles to avoid CSS conflicts with host pages.
 */
const OmniFeedbackWidget: React.FC<WidgetProps> = ({
  publicKey,
  boardId,
  apiUrl = DEFAULTS.API_URL,
  theme = {},
  position = DEFAULTS.POSITION,
  onClose,
  portalUrl,
  onOpenChange,
  onSuccess,
  user,
}) => {
  const isDesktop = useResponsive();
  const {
    isOpen,
    isClosing,
    isOpening,
    isFabBouncing,
    open,
    startClose,
    close,
    triggerFabBounce,
  } = useAnimationState();

  const [activeTab, setActiveTab] = useState<TabType>('submit');

  const handleFabClick = () => {
    triggerFabBounce();

    if (isOpen) {
      startClose();
      onOpenChange?.(false);
    } else {
      setActiveTab('submit');
      open();
      onOpenChange?.(true);
    }
  };

  const handleClose = () => {
    startClose();
    onClose?.();
    onOpenChange?.(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'submit':
        return (
          <SubmitTab
            apiUrl={apiUrl}
            boardId={boardId}
            onSuccess={onSuccess || handleClose}
            publicKey={publicKey}
            user={user}
          />
        );
      case 'roadmap':
        return (
          <IframeTab
            fallbackMessage='Connect portalUrl to show roadmap here.'
            path='/roadmap'
            portalUrl={portalUrl}
            title='Roadmap'
          />
        );
      case 'changelog':
        return (
          <IframeTab
            fallbackMessage='Connect portalUrl to show changelog here.'
            path='/changelog'
            portalUrl={portalUrl}
            title='Changelog'
          />
        );
    }
  };

  return (
    <div
      className='omni-feedback-widget'
      style={{
        position: 'fixed',
        zIndex: theme.zIndex ?? 999_999,
        fontFamily: theme.fontFamily || DEFAULTS.FONT_FAMILY,
        color: '#374151',
        fontSize: '14px',
        lineHeight: '1.625',
      }}
    >
      {/* Floating Action Button */}
      <FloatingActionButton
        isClosing={isClosing}
        isOpen={isOpen}
        isOpening={isOpening}
        onClick={handleFabClick}
        theme={theme}
      />

      {/* Widget Panel */}
      <WidgetPanel
        isClosing={isClosing}
        isDesktop={isDesktop}
        isOpen={isOpen}
        onClose={handleClose}
        position={position}
        theme={theme}
      >
        {/* Scrollable content area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: 'white',
          }}
        >
          <div style={{ padding: 0 }}>{renderTabContent()}</div>
        </div>

        {/* Bottom navigation tabs */}
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </WidgetPanel>
    </div>
  );
};

export default OmniFeedbackWidget;
