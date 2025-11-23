import type React from 'react';
import { COLORS } from '../constants';
import AskIcon from '../icons/AskIcon';
import ChangelogIcon from '../icons/ChangelogIcon';
import RoadmapIcon from '../icons/RoadmapIcon';
import type { BottomNavigationProps, TabType } from '../types';

/**
 * BottomNavigation - Tab navigation for the widget
 *
 * Displays three tabs at the bottom of the widget panel:
 * - Ask: Feedback submission form
 * - Roadmap: Embedded roadmap view
 * - Changelog: Embedded changelog view
 *
 * Features:
 * - Active state highlighting
 * - Hover effects
 * - Icon + label for each tab
 * - Responsive grid layout
 *
 * @param activeTab - Currently active tab
 * @param onTabChange - Callback when user clicks a tab
 */
const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: Array<{ key: TabType; label: string; icon: React.ReactNode }> = [
    {
      key: 'submit',
      label: 'Ask',
      icon: <AskIcon style={{ height: '20px', width: '20px' }} />,
    },
    {
      key: 'roadmap',
      label: 'Roadmap',
      icon: <RoadmapIcon style={{ height: '20px', width: '20px' }} />,
    },
    {
      key: 'changelog',
      label: 'Changelog',
      icon: <ChangelogIcon style={{ height: '20px', width: '20px' }} />,
    },
  ];

  return (
    <div
      style={{
        borderTop: `1px solid ${COLORS.GRAY[200]}`,
        backgroundColor: 'white',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        }}
      >
        {tabs.map(({ key, label, icon }) => {
          const isActive = activeTab === key;
          const baseStyle: React.CSSProperties = {
            display: 'flex',
            cursor: 'pointer',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            paddingTop: '12px',
            paddingBottom: '12px',
            fontSize: '12px',
            transition: 'color 0.15s ease',
            color: isActive ? COLORS.PRIMARY : COLORS.GRAY[500],
            border: 'none',
            backgroundColor: 'transparent',
          };

          return (
            <button
              aria-selected={isActive}
              key={key}
              onClick={() => onTabChange(key)}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = COLORS.GRAY[700];
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = COLORS.GRAY[500];
                }
              }}
              role='tab'
              style={baseStyle}
              type='button'
            >
              {icon}
              <span style={{ marginTop: '4px' }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
