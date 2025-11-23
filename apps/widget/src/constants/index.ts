/**
 * Z-index layers for the widget
 * These ensure proper stacking order of widget elements
 */
export const Z_INDEX = {
  FAB: 1_000_000,
  PANEL: 1_000_001,
  DROPDOWN: 1_000_002,
  IFRAME: 2147483646, // Very high to ensure it's above most page content
} as const;

/**
 * Animation durations in milliseconds
 */
export const ANIMATION_DURATION = {
  CLOSE: 200,
  OPEN: 300,
  FAB_BOUNCE: 450,
  ICON_SWAP: 340,
} as const;

export const BREAKPOINTS = {
  DESKTOP: 768, // Minimum width for desktop layout
} as const;

export const FORM_LIMITS = {
  TITLE_MAX_LENGTH: 250,
  DESCRIPTION_MAX_LENGTH: 5000,
} as const;

/**
 * Default configuration values
 */
export const DEFAULTS = {
  API_URL: process.env.PUBLIC_BACKEND_SERVER_URL ?? 'https://localhost:8080',
  POSITION: 'above-button' as const,
  PRIMARY_COLOR: '#007bff',
  BORDER_RADIUS: '12px',
  FONT_FAMILY:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
} as const;

export const COLORS = {
  PRIMARY: '#2563eb',
  GRAY: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    400: '#9ca3af',
    500: '#6b7280',
    700: '#374151',
  },
  ERROR: {
    BACKGROUND: '#fef2f2',
    BORDER: '#fecaca',
    TEXT: '#b91c1c',
  },
  GRADIENT: {
    START: '#1e40af',
    END: '#1d4ed8',
  },
} as const;

export const REGEX = {
  TRAILING_SLASH: /\/$/,
} as const;
