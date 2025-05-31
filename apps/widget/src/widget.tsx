import React from 'react';
import { createRoot } from 'react-dom/client';
import OmniFeedbackWidget from './OmniFeedbackWidget';
import './index.css';

// Global interface for the widget
interface OmniFeedbackWidgetOptions {
  tenantId: string;
  jwtAuthToken?: string;
  apiUrl?: string;
  theme?: {
    primaryColor?: string;
    buttonText?: string;
  };
  targetElement?: string | HTMLElement;
}

interface OmniFeedbackWidgetInstance {
  destroy: () => void;
  show: () => void;
  hide: () => void;
}

class OmniFeedbackWidgetManager {
  private instances: Map<string, { root: any; container: HTMLElement }> = new Map();
  
  init(options: OmniFeedbackWidgetOptions): OmniFeedbackWidgetInstance {
    const { targetElement = 'body', ...widgetProps } = options;
    
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

    // Create a unique container for this widget instance
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'omnifeedback-widget-container';
    widgetContainer.style.position = 'relative';
    widgetContainer.style.zIndex = '999999';
    
    // Generate unique ID for this instance
    const instanceId = `omnifeedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    widgetContainer.id = instanceId;
    
    container.appendChild(widgetContainer);

    // Create React root and render widget
    const root = createRoot(widgetContainer);
    
    let isVisible = true;
    
    const renderWidget = (visible: boolean = true) => {
      root.render(
        <div style={{ display: visible ? 'block' : 'none' }}>
          <OmniFeedbackWidget 
            {...widgetProps}
            onClose={() => {
              // Widget handles its own visibility, but we can add hooks here
            }}
          />
        </div>
      );
    };

    renderWidget();

    // Store instance for cleanup
    this.instances.set(instanceId, { root, container: widgetContainer });

    // Return instance control object
    return {
      destroy: () => {
        const instance = this.instances.get(instanceId);
        if (instance) {
          instance.root.unmount();
          instance.container.remove();
          this.instances.delete(instanceId);
        }
      },
      show: () => {
        isVisible = true;
        renderWidget(true);
      },
      hide: () => {
        isVisible = false;
        renderWidget(false);
      }
    };
  }

  // Cleanup all instances
  destroyAll() {
    this.instances.forEach((instance, id) => {
      instance.root.unmount();
      instance.container.remove();
    });
    this.instances.clear();
  }
}

// Create global instance
const widgetManager = new OmniFeedbackWidgetManager();

// Global API that will be exposed
const OmniFeedbackWidgetAPI = {
  init: (options: OmniFeedbackWidgetOptions) => widgetManager.init(options),
  destroyAll: () => widgetManager.destroyAll(),
  version: '1.0.0'
};

// For UMD export - ensure it's available globally
if (typeof window !== 'undefined') {
  (window as any).OmniFeedbackWidget = OmniFeedbackWidgetAPI;
}

// For UMD export
export default OmniFeedbackWidgetAPI;

// Auto-initialize if data attributes are found on script tag
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  const initializeFromDataAttributes = () => {
    // Look for script tag with data attributes
    const scriptTags = document.querySelectorAll('script[data-tenant-id]');
    
    scriptTags.forEach((script) => {
      const tenantId = script.getAttribute('data-tenant-id');
      const jwtAuthToken = script.getAttribute('data-jwt-token');
      const apiUrl = script.getAttribute('data-api-url');
      const targetElement = script.getAttribute('data-target') || 'body';
      const primaryColor = script.getAttribute('data-primary-color');
      
      if (tenantId) {
        try {
          widgetManager.init({
            tenantId,
            jwtAuthToken: jwtAuthToken || undefined,
            apiUrl: apiUrl || undefined,
            targetElement,
            theme: {
              primaryColor: primaryColor || undefined,
            }
          });
        } catch (error) {
          console.error('OmniFeedback Widget auto-initialization failed:', error);
        }
      }
    });
  };

  // Try to initialize immediately if DOM is already ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFromDataAttributes);
  } else {
    initializeFromDataAttributes();
  }
}