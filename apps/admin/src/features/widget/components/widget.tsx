// import { useEffect } from 'react';

// interface OmniFeedbackWidgetOptions {
//   publicKey: string;
//   boardId?: string;
//   user?: {
//     id?: string;
//     name?: string;
//     email?: string;
//   };
//   customData?: { [key: string]: string | undefined };
//   jwtAuthToken?: string;
//   apiUrl?: string;
//   theme?: {
//     primaryColor?: string;
//     buttonText?: string;
//   };
//   targetElement?: string | HTMLElement;
//   position?: "center" | "above-button";
// }

// interface OmniFeedbackWidgetInstance {
//   destroy: () => void;
//   show: () => void;
//   hide: () => void;
//   isVisible: () => boolean;
//   getElement: () => HTMLElement;
// }

// interface OmniFeedbackWidgetAPI {
//   init: (options: OmniFeedbackWidgetOptions) => OmniFeedbackWidgetInstance;
//   destroyAll: () => void;
//   version: string;
// }

// declare global {
//   interface Window {
//     OmniFeedbackWidget: OmniFeedbackWidgetAPI;
//   }
// }

// const OmniFeedbackWidget = () => {
//   useEffect(() => {
//     // Load widget script
//     const script = document.createElement('script');
//     script.src = 'http://localhost:3000/omnifeedback-widget.js';
//     script.async = true;
//     document.head.appendChild(script);

//     // Initialize widget when script loads
//     script.onload = () => {
//       if (window.OmniFeedbackWidget) {
//         window.OmniFeedbackWidget.init({
//             "publicKey": "1234567891234567",
//             "apiUrl": "https://localhost:8080",
//             "theme": {
//                 "primaryColor": "#3b82f6",
//                 "buttonText": "Feedback"
//             },
//             "position": "above-button"
//             });
//       }
//     };

//     return () => {
//       // Cleanup
//       if (window.OmniFeedbackWidget) {
//         window.OmniFeedbackWidget.destroyAll();
//       }
//       document.head.removeChild(script);
//     };
//   }, []);

//   return null;
// };

// export default OmniFeedbackWidget;

import { useEffect, useRef } from 'react';

// TypeScript support - all types are included inline for immediate use

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
}

interface OmniFeedbackWidgetInstance {
  destroy: () => void;
  show: () => void;
  hide: () => void;
  isVisible: () => boolean;
  getElement: () => HTMLElement;
}

interface OmniFeedbackWidgetAPI {
  init: (options: OmniFeedbackWidgetOptions) => OmniFeedbackWidgetInstance;
  destroyAll: () => void;
  version: string;
}

declare global {
  interface Window {
    OmniFeedbackWidget: OmniFeedbackWidgetAPI;
  }
}

// Global script loading state to prevent multiple loads across route changes
const scriptLoadState = {
  loading: false,
  loaded: false,
  promise: null as Promise<void> | null,
};

const loadScriptOnce = (scriptUrl: string): Promise<void> => {
  // If already loaded, return immediately
  if (scriptLoadState.loaded && window.OmniFeedbackWidget) {
    return Promise.resolve();
  }

  // If already loading, return the existing promise
  if (scriptLoadState.loading && scriptLoadState.promise) {
    return scriptLoadState.promise;
  }

  // Check if script already exists in DOM
  const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
  if (existingScript) {
    scriptLoadState.loaded = true;
    return Promise.resolve();
  }

  // Start loading
  scriptLoadState.loading = true;
  scriptLoadState.promise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;

    script.onload = () => {
      scriptLoadState.loaded = true;
      scriptLoadState.loading = false;
      resolve();
    };

    script.onerror = () => {
      scriptLoadState.loading = false;
      scriptLoadState.promise = null;
      reject(new Error('Failed to load OmniFeedback widget script'));
    };

    document.head.appendChild(script);
  });

  return scriptLoadState.promise;
};

const OmniFeedbackWidget = () => {
  const instanceRef = useRef<OmniFeedbackWidgetInstance | null>(null);

  useEffect(() => {
    const initWidget = async () => {
      try {
        // Load script only once per domain
        await loadScriptOnce(
          'https://codesbyayush.github.io/widget/omnifeedback-widget.js',
        );

        // Initialize widget if not already initialized
        if (window.OmniFeedbackWidget && !instanceRef.current) {
          instanceRef.current = window.OmniFeedbackWidget.init({
            publicKey: '0d9f0628-0547-4887-8931-2ea1e0eab302',
            apiUrl:
              import.meta.env.VITE_BACKEND_SERVER_URL ||
              'http://localhost:8080',
            theme: {
              primaryColor: '#3b82f6',
              buttonText: 'Feedback',
            },
            position: 'above-button',
          });
        }
      } catch (_error) {
        console.error('Error initializing OmniFeedback widget:', _error);
      }
    };

    initWidget();

    // Only cleanup the widget instance, not the script
    return () => {
      if (instanceRef.current) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once

  return null;
};

export default OmniFeedbackWidget;
