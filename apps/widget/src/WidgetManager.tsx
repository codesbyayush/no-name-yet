import { createRoot } from 'react-dom/client';
import { WIDGET_STYLE_MARKER } from './constants';
import OmniFeedbackWidget from './OmniFeedbackWidget';
import type {
  OmniFeedbackWidgetInstance,
  OmniFeedbackWidgetOptions,
} from './types';

export class OmniFeedbackWidgetManager {
  private readonly instances: Map<
    string,
    {
      root: ReturnType<typeof createRoot> | null;
      container: HTMLElement;
      options: OmniFeedbackWidgetOptions;
    }
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

    const root: ReturnType<typeof createRoot> | null = null;

    // Generate unique ID and store instance
    const ID_RADIX = 36;
    const ID_START_INDEX = 2;
    const ID_LENGTH = 9;
    const instanceId = `omnifeedback-${Date.now()}-${Math.random().toString(ID_RADIX).substr(ID_START_INDEX, ID_LENGTH)}`;
    this.instances.set(instanceId, { root, container: iframe, options });

    iframe.addEventListener(
      'load',
      () => {
        this.setupFrameCommunication(
          iframe,
          options,
          instanceId,
          setFrameOpenSize,
          setFrameClosedSize,
        );
      },
      { once: true },
    );

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
      update: (newOptions: Partial<OmniFeedbackWidgetOptions>) => {
        const instance = this.instances.get(instanceId);
        if (instance) {
          // Merge new options with existing options
          // Deep merge for user object if provided
          const updatedOptions = {
            ...instance.options,
            ...newOptions,
            user: {
              ...instance.options.user,
              ...newOptions.user,
            },
            theme: {
              ...instance.options.theme,
              ...newOptions.theme,
            },
          };
          instance.options = updatedOptions;

          // Re-render if root is ready
          if (instance.root && (instance as any).render) {
            (instance as any).render(updatedOptions);
          }
        }
      },
      isVisible: () =>
        (this.instances.get(instanceId)?.container as HTMLElement).style
          .display !== 'none',
      getElement: () =>
        this.instances.get(instanceId)?.container as HTMLElement,
    };
  }

  private setupFrameCommunication(
    iframe: HTMLIFrameElement,
    options: OmniFeedbackWidgetOptions,
    instanceId: string,
    setFrameOpenSize: () => void,
    setFrameClosedSize: () => void,
  ) {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      return;
    }
    // Clone only widget styles to iframe (not host styles to avoid conflicts)
    // Widget styles are marked with data-omnifeedback-widget attribute
    const head = doc.head;
    const widgetStyles = document.querySelectorAll<HTMLStyleElement>(
      `style[${WIDGET_STYLE_MARKER}]`,
    );
    for (const style of Array.from(widgetStyles)) {
      const cloned = doc.createElement('style');
      cloned.textContent = style.textContent || '';
      head.appendChild(cloned);
    }

    const mount = doc.getElementById('root');
    if (!mount) {
      return;
    }
    const root = createRoot(mount);

    const handleOpenChange = (open: boolean) => {
      if (open) {
        setFrameOpenSize();
      } else {
        setFrameClosedSize();
      }
    };

    const renderWidget = (currentOptions: OmniFeedbackWidgetOptions) => {
      if (!root) {
        return;
      }
      const { position = 'above-button', ...props } = currentOptions;
      root.render(
        <div style={{ display: 'block' }}>
          <OmniFeedbackWidget
            {...props}
            onClose={() => {
              // Handled by onOpenChange
            }}
            onOpenChange={handleOpenChange}
            position={position}
          />
        </div>,
      );
    };

    // Initial render
    renderWidget(options);

    // Save root reference into instance for cleanup and updates
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.root = root;
      // Store the render function on the instance so we can call it later
      (instance as any).render = renderWidget;
    }
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
