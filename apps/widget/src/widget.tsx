import './index.css';
import { WIDGET_STYLE_MARKER } from './constants';
import type {
  OmniFeedbackWidgetInstance,
  OmniFeedbackWidgetOptions,
} from './types';
import { OmniFeedbackWidgetManager } from './WidgetManager';

// Mark widget styles for identification when cloning to iframe
// This runs immediately after CSS is injected by the bundler
if (typeof document !== 'undefined') {
  // Find and mark style elements containing our widget CSS
  // We check for unique identifiers from our index.css
  const styleElements = document.querySelectorAll(
    'style:not([data-omnifeedback-widget])',
  );
  for (const style of Array.from(styleElements)) {
    const content = style.textContent || '';
    // Checking multiple unique widget CSS identifiers to ensure accuracy
    if (
      content.includes('.omni-feedback-widget') ||
      content.includes('fab-bounce-keyframes') ||
      content.includes('.grow-in-br')
    ) {
      style.setAttribute(WIDGET_STYLE_MARKER, 'true');
    }
  }
}

// Create global instance manager
const widgetManager = new OmniFeedbackWidgetManager();

// We need a way to track the public instances returned by init to call update on them.
// Wrapping the manager to handle the global singleton pattern
let globalInstance: OmniFeedbackWidgetInstance | null = null;

// Global API that will be exposed
const OmniFeedbackWidgetAPI = {
  init: (options: OmniFeedbackWidgetOptions) => {
    if (globalInstance) {
      globalInstance.update(options);
      return globalInstance;
    }
    globalInstance = widgetManager.init(options);
    return globalInstance;
  },
  destroyAll: () => {
    widgetManager.destroyAll();
    globalInstance = null;
  },
  update: (options: Partial<OmniFeedbackWidgetOptions>) => {
    if (globalInstance) {
      globalInstance.update(options);
    }
  },
  version: '1.0.0',
};

// For UMD export - ensure it's available globally without using 'any'
declare global {
  interface Window {
    OmniFeedbackWidget?: typeof OmniFeedbackWidgetAPI;
  }
}

if (typeof window !== 'undefined') {
  (
    window as Window & { OmniFeedbackWidget?: typeof OmniFeedbackWidgetAPI }
  ).OmniFeedbackWidget = OmniFeedbackWidgetAPI;
}

// For UMD export
export default OmniFeedbackWidgetAPI;

// Auto-initialize if data attributes are found on script tag
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  const parseOptionsFromScript = (
    scriptTag: HTMLScriptElement,
  ): OmniFeedbackWidgetOptions | null => {
    const {
      publicKey,
      boardId,
      apiUrl,
      target,
      position,
      primaryColor,
      buttonText,
      userId,
      userName,
      userEmail,
      userCompanyId,
      user, // Allow passing full user JSON
      jwtAuthToken,
      portalUrl,
      borderRadius,
      fontFamily,
      zIndex,
      ...customData // Capture all other data-* attributes as customData
    } = scriptTag.dataset;

    if (!publicKey) return null;

    let parsedUser = {};
    if (user) {
      try {
        parsedUser = JSON.parse(user);
      } catch (e) {
        console.error('Failed to parse data-user attribute', e);
      }
    }

    return {
      publicKey,
      boardId,
      apiUrl,
      targetElement: target,
      position:
        position === 'center' || position === 'above-button'
          ? position
          : undefined,
      theme: {
        primaryColor,
        buttonText,
        borderRadius,
        fontFamily,
        zIndex: zIndex ? Number.parseInt(zIndex, 10) : undefined,
      },
      user: {
        id: userId,
        name: userName,
        email: userEmail,
        companyId: userCompanyId,
        ...parsedUser,
      },
      customData: (() => {
        const result: Record<string, string> = {};
        for (const [k, v] of Object.entries(customData)) {
          if (typeof v === 'string') {
            result[k] = v;
          }
        }
        return result;
      })(),
      jwtAuthToken,
      portalUrl,
    };
  };

  const initializeFromDataAttributes = () => {
    // Look for a script tag with the required data-public-key attribute.
    const scriptTag = document.querySelector('script[data-public-key]');

    if (scriptTag instanceof HTMLScriptElement) {
      const options = parseOptionsFromScript(scriptTag);
      if (options) {
        try {
          OmniFeedbackWidgetAPI.init(options);
        } catch (_error) {
          // Silently fail widget initialization from data attributes
        }
      }
    }
  };

  // Try to initialize immediately if DOM is already ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFromDataAttributes);
  } else {
    initializeFromDataAttributes();
  }
}
