import type React from 'react';

/**
 * Theme customization options for the widget
 */
export interface WidgetTheme {
  primaryColor?: string;
  buttonText?: string;
  borderRadius?: string;
  fontFamily?: string;
  zIndex?: number;
}

export interface WidgetUser {
  id?: string;
  name?: string;
  email?: string;
}

export type TabType = 'submit' | 'roadmap' | 'changelog';

export type WidgetPosition = 'center' | 'above-button';

export interface WidgetProps {
  publicKey: string;
  boardId?: string;
  user?: WidgetUser;
  customData?: Record<string, string | undefined>;
  apiUrl?: string;
  theme?: WidgetTheme;
  position?: WidgetPosition;
  onClose?: () => void;
  portalUrl?: string;
  onOpenChange?: (isOpen: boolean) => void;
  onSuccess?: () => void;
}

export interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

export interface FloatingActionButtonProps {
  isOpen: boolean;
  isOpening: boolean;
  isClosing: boolean;
  theme: WidgetTheme;
  onClick: () => void;
}

export interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export interface WidgetPanelProps {
  isOpen: boolean;
  isClosing: boolean;
  isDesktop: boolean;
  position: WidgetPosition;
  theme: WidgetTheme;
  children: React.ReactNode;
  onClose: () => void;
}

export interface TabContentProps {
  apiUrl: string;
  publicKey: string;
  boardId?: string;
  portalUrl?: string;
  onSuccess?: () => void;
}

export interface OmniFeedbackWidgetOptions {
  publicKey: string;
  boardId?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    companyId?: string;
  };
  customData?: { [key: string]: string | undefined };
  jwtAuthToken?: string;
  apiUrl?: string;
  theme?: {
    primaryColor?: string;
    buttonText?: string;
    borderRadius?: string;
    fontFamily?: string;
    zIndex?: number;
  };
  targetElement?: string | HTMLElement;
  position?: 'center' | 'above-button';
  /** Optional portal base URL to embed roadmap/changelog in the widget */
  portalUrl?: string;
}

export interface OmniFeedbackWidgetInstance {
  destroy: () => void;
  show: () => void;
  hide: () => void;
  update: (options: Partial<OmniFeedbackWidgetOptions>) => void;
  isVisible: () => boolean;
  getElement: () => HTMLElement;
}
