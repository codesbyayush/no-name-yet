import { createRoot } from 'react-dom/client';
import OmniFeedbackWidget from './OmniFeedbackWidget';
import './index.css';

// Global interface for the widget
interface OmniFeedbackWidgetOptions {
  publicKey: string;
  boardId?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
  };
  customData?: { [key: string]: string | undefined };
  jwtAuthToken?: string;
  apiUrl?: string;
  theme?: {
    primaryColor?: string;
    buttonText?: string;
  };
  targetElement?: string | HTMLElement;
  position?: 'center' | 'above-button';
  /** Optional portal base URL to embed roadmap/changelog in the widget */
  portalUrl?: string;
}

interface OmniFeedbackWidgetInstance {
  destroy: () => void;
  show: () => void;
  hide: () => void;
  isVisible: () => boolean;
  getElement: () => HTMLElement;
}

class OmniFeedbackWidgetManager {
  private readonly instances: Map<
    string,
    { root: ReturnType<typeof createRoot> | null; container: HTMLElement }
  > = new Map();

  init(options: OmniFeedbackWidgetOptions): OmniFeedbackWidgetInstance {
    const {
      targetElement = 'body',
      position = 'above-button',
      ...widgetProps
    } = options;

    // Get target container
    let container: HTMLElement;
    if (typeof targetElement === 'string') {
      container = document.querySelector(targetElement) as HTMLElement;
      if (!container) {
        throw new Error(`Target element "${targetElement}" not found`);
      }
    } else {
      container = targetElement;
    }

    // Create an isolated iframe overlay
    const iframe = document.createElement('iframe');
    iframe.title = 'OmniFeedbackWidget';
    iframe.setAttribute('aria-label', 'Omni Feedback Widget');
    iframe.style.position = 'fixed';
    iframe.style.border = '0';
    iframe.style.background = 'transparent';
    iframe.style.zIndex = '2147483646'; // very high

    let prevTimeout: number | null = null;
    const setFrameClosedSize = (timeout = 500) => {
      iframe.style.backgroundColor = 'transparent';
      iframe.style.backdropFilter = 'none';
      if (prevTimeout) {
        window.clearTimeout(prevTimeout);
      }
      prevTimeout = window.setTimeout(() => {
        iframe.style.top = '';
        iframe.style.left = '';
        iframe.style.right = '0px';
        iframe.style.bottom = '0px';
        iframe.style.width = '70px';
        iframe.style.height = '70px';
        iframe.style.pointerEvents = 'auto';
      }, timeout);
    };
    const setFrameOpenSize = () => {
      if (prevTimeout) {
        window.clearTimeout(prevTimeout);
      }
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.pointerEvents = 'auto';
      iframe.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      iframe.style.backdropFilter = 'blur(1px)';
    };
    setFrameClosedSize(0);

    container.appendChild(iframe);

    // Prepare iframe doc
    iframe.srcdoc = `<!doctype html><html><head>
<meta charset='utf-8'/>
<meta name='viewport' content='width=device-width, initial-scale=1'/>
<style>html,body{margin:0;height:100%;background:transparent !important;overflow: hidden;}</style>
</head><body><div id='root'></div></body></html>`;

    let root: ReturnType<typeof createRoot> | null = null;

    const onFrameLoad = () => {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) {
        return;
      }
      // Clone host styles to iframe so widget styles apply inside
      const head = doc.head;
      const hostLinks = document.querySelectorAll<HTMLLinkElement>(
        'link[rel="stylesheet"]'
      );
      for (const link of Array.from(hostLinks)) {
        const cloned = doc.createElement('link');
        cloned.rel = 'stylesheet';
        cloned.href = link.href;
        head.appendChild(cloned);
      }
      const hostStyles = document.querySelectorAll<HTMLStyleElement>('style');
      for (const style of Array.from(hostStyles)) {
        const cloned = doc.createElement('style');
        cloned.textContent = style.textContent || '';
        head.appendChild(cloned);
      }

      const mount = doc.getElementById('root');
      if (!mount) {
        return;
      }
      root = createRoot(mount);

      const handleOpenChange = (open: boolean) => {
        if (open) {
          setFrameOpenSize();
        } else {
          setFrameClosedSize();
        }
      };

      const renderWidget = (visible = true) => {
        if (!root) {
          return;
        }
        root.render(
          <div style={{ display: visible ? 'block' : 'none' }}>
            <OmniFeedbackWidget
              {...widgetProps}
              onClose={() => {
                // Handled by onOpenChange
              }}
              onOpenChange={handleOpenChange}
              position={position}
            />
          </div>
        );
      };

      renderWidget();

      // Save root reference into instance for cleanup
      const instance = this.instances.get(instanceId);
      if (instance) {
        instance.root = root;
      }
    };

    iframe.addEventListener('load', onFrameLoad, { once: true });

    // Generate unique ID and store instance
    const ID_RADIX = 36;
    const ID_START_INDEX = 2;
    const ID_LENGTH = 9;
    const instanceId = `omnifeedback-${Date.now()}-${Math.random().toString(ID_RADIX).substr(ID_START_INDEX, ID_LENGTH)}`;
    this.instances.set(instanceId, { root, container: iframe });

    // Return instance control object
    return {
      destroy: () => {
        const instance = this.instances.get(instanceId);
        if (instance) {
          try {
            instance.root?.unmount?.();
          } catch {
            // Ignore unmount errors - widget is being destroyed anyway
          }
          instance.container.remove();
          this.instances.delete(instanceId);
        }
      },
      show: () => {
        (
          this.instances.get(instanceId)?.container as HTMLElement
        ).style.display = 'block';
      },
      hide: () => {
        (
          this.instances.get(instanceId)?.container as HTMLElement
        ).style.display = 'none';
      },
      isVisible: () =>
        (this.instances.get(instanceId)?.container as HTMLElement).style
          .display !== 'none',
      getElement: () =>
        this.instances.get(instanceId)?.container as HTMLElement,
    };
  }

  // Cleanup all instances
  destroyAll() {
    for (const instance of this.instances.values()) {
      instance.root?.unmount?.();
      instance.container.remove();
    }
    this.instances.clear();
  }
}

// Create global instance
const widgetManager = new OmniFeedbackWidgetManager();

// Global API that will be exposed
const OmniFeedbackWidgetAPI = {
  init: (options: OmniFeedbackWidgetOptions) => widgetManager.init(options),
  destroyAll: () => widgetManager.destroyAll(),
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
  const initializeFromDataAttributes = () => {
    // Look for a script tag with the required data-public-key attribute.
    // This will find the first script tag that matches, which is typical for widgets.
    const scriptTag = document.querySelector('script[data-public-key]');

    if (scriptTag instanceof HTMLScriptElement) {
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
        jwtAuthToken,
        portalUrl,
        ...customData // Capture all other data-* attributes as customData
      } = scriptTag.dataset;

      if (publicKey) {
        try {
          widgetManager.init({
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
            },
            user: {
              id: userId,
              name: userName,
              email: userEmail,
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
          });
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
