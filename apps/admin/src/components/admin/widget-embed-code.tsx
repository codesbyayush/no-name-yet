import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import { Textarea } from '@workspace/ui/components/textarea';
import { cn } from '@workspace/ui/lib/utils';
import { Code2, Copy, Info, Settings } from 'lucide-react';
import { useMemo, useState } from 'react';

interface WidgetConfig {
  organizationId: string;
  boardId?: string;
  position: 'above-button' | 'center';
  buttonColor: string;
  buttonText: string;
  apiUrl?: string;
  customDomain?: string;
}

interface OptionGroup {
  title: string;
  description: string;
  options: {
    key: keyof WidgetConfig;
    label: string;
    description: string;
    changeable: boolean;
    reason: string;
    type: 'text' | 'select' | 'color';
    options?: { label: string; value: string }[];
  }[];
}

export function WidgetEmbedCode() {
  const [config, setConfig] = useState<WidgetConfig>({
    organizationId: 'org_123456789',
    boardId: 'board_general',
    position: 'above-button',
    buttonColor: '#3b82f6',
    buttonText: 'Feedback',
    apiUrl: import.meta.env.PUBLIC_BACKEND_SERVER_URL || '',
    customDomain: '',
  });

  const [copied, setCopied] = useState(false);

  const optionGroups: OptionGroup[] = [
    {
      title: 'Core Configuration',
      description: 'Essential settings for widget identification',
      options: [
        {
          key: 'organizationId',
          label: 'Organization ID',
          description: 'Unique identifier for your organization',
          changeable: false,
          reason:
            'Auto-generated from your organization settings. Required for widget to connect to correct data.',
          type: 'text',
        },
        {
          key: 'boardId',
          label: 'Board ID',
          description: 'Which board should receive the feedback',
          changeable: true,
          reason:
            'You can select different boards to categorize feedback (e.g., bugs, features, general).',
          type: 'select',
          options: [
            { label: 'General Feedback', value: 'board_general' },
            { label: 'Bug Reports', value: 'board_bugs' },
            { label: 'Feature Requests', value: 'board_features' },
          ],
        },
        {
          key: 'apiUrl',
          label: 'API URL',
          description: 'Backend API endpoint for the widget',
          changeable: true,
          reason:
            'Point to your backend server. Use localhost for development.',
          type: 'text',
        },
      ],
    },
    {
      title: 'Appearance',
      description: 'Visual customization options',
      options: [
        {
          key: 'position',
          label: 'Position',
          description: 'Where the widget appears on screen',
          changeable: true,
          reason:
            "'Above-button' shows as floating button, 'center' shows in center of screen.",
          type: 'select',
          options: [
            { label: 'Floating Button', value: 'above-button' },
            { label: 'Center Screen', value: 'center' },
          ],
        },
        {
          key: 'buttonColor',
          label: 'Button Color',
          description: 'Primary color for the feedback button',
          changeable: true,
          reason:
            'Customize to match your brand colors for better integration.',
          type: 'color',
        },
        {
          key: 'buttonText',
          label: 'Button Text',
          description: 'Text displayed on the feedback button',
          changeable: true,
          reason:
            'Customize the call-to-action text. Keep it short for better mobile experience.',
          type: 'text',
        },
      ],
    },
    {
      title: 'Deployment',
      description: 'Widget hosting and domain settings',
      options: [
        {
          key: 'customDomain',
          label: 'Custom Domain',
          description: 'Use your own domain for the widget',
          changeable: false,
          reason:
            'Available with enterprise plan. Requires DNS configuration and SSL setup.',
          type: 'text',
        },
      ],
    },
  ];

  const generateEmbedCode = useMemo(() => {
    const configString = JSON.stringify(
      {
        publicKey: config.organizationId, // Widget expects publicKey, not organizationId
        ...(config.boardId && { boardId: config.boardId }),
        ...(config.apiUrl && { apiUrl: config.apiUrl }),
        theme: {
          primaryColor: config.buttonColor,
          buttonText: config.buttonText,
        },
        position: config.position, // Use the actual position value
      },
      null,
      2,
    );

    const domain = config.customDomain || 'localhost:3000'; // Default to localhost for development

    return {
      script: `<!-- OmniFeedback Widget -->
<script>
  // Widget will auto-initialize when script loads
  // Or you can manually initialize:
  // window.OmniFeedbackWidget.init(${configString});
</script>
<!-- Script loads once and persists across route changes -->
<script src="http://${domain}/omnifeedback-widget.js" async></script>`,

      react: `import { useEffect, useRef } from 'react';

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
  position?: "center" | "above-button";
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
  const existingScript = document.querySelector(\`script[src="\${scriptUrl}"]\`);
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
        await loadScriptOnce('http://${domain}/omnifeedback-widget.js');
        
        // Initialize widget if not already initialized
        if (window.OmniFeedbackWidget && !instanceRef.current) {
          instanceRef.current = window.OmniFeedbackWidget.init(${configString});
        }
      } catch (error) {
        console.error('Failed to initialize OmniFeedback widget:', error);
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

export default OmniFeedbackWidget;`,

      types: `// TypeScript declarations for OmniFeedbackWidget
// Copy these interfaces to your project for type safety

export interface OmniFeedbackWidgetOptions {
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
  position?: "center" | "above-button";
}

export interface OmniFeedbackWidgetInstance {
  destroy: () => void;
  show: () => void;
  hide: () => void;
  isVisible: () => boolean;
  getElement: () => HTMLElement;
}

export interface OmniFeedbackWidgetAPI {
  init: (options: OmniFeedbackWidgetOptions) => OmniFeedbackWidgetInstance;
  destroyAll: () => void;
  version: string;
}

// Extend the global Window interface
declare global {
  interface Window {
    OmniFeedbackWidget: OmniFeedbackWidgetAPI;
  }
}

// Export for module usage
export {};`,
    };
  }, [config]);

  const updateConfig = (key: keyof WidgetConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_err) {}
  };

  return (
    <div className='grid h-full grid-cols-1 gap-6 lg:grid-cols-3'>
      {/* Options Panel - Left Side */}
      <div className='space-y-6 overflow-y-auto lg:col-span-1'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='h-5 w-5' />
              Widget Configuration
            </CardTitle>
            <CardDescription>
              Customize your widget settings and appearance
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {optionGroups.map((group) => (
              <div className='space-y-4' key={group.title}>
                <div>
                  <h3 className='font-semibold text-sm'>{group.title}</h3>
                  <p className='text-muted-foreground text-xs'>
                    {group.description}
                  </p>
                </div>

                <div className='space-y-4'>
                  {group.options.map((option) => (
                    <div className='space-y-2' key={option.key}>
                      <div className='flex items-center justify-between'>
                        <Label className='text-sm' htmlFor={option.key}>
                          {option.label}
                        </Label>
                        <Badge
                          className='text-xs'
                          variant={option.changeable ? 'default' : 'secondary'}
                        >
                          {option.changeable ? 'Editable' : 'Fixed'}
                        </Badge>
                      </div>

                      {option.type === 'text' && (
                        <Input
                          className={cn(!option.changeable && 'opacity-50')}
                          disabled={!option.changeable}
                          id={option.key}
                          onChange={(e) =>
                            updateConfig(option.key, e.target.value)
                          }
                          value={config[option.key] as string}
                        />
                      )}

                      {option.type === 'select' && (
                        <Select
                          disabled={!option.changeable}
                          onValueChange={(value) =>
                            updateConfig(option.key, value)
                          }
                          value={config[option.key] as string}
                        >
                          <SelectTrigger
                            className={cn(!option.changeable && 'opacity-50')}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {option.options?.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {option.type === 'color' && (
                        <div className='flex items-center space-x-2'>
                          <Input
                            className='h-8 w-12 rounded border p-1'
                            disabled={!option.changeable}
                            onChange={(e) =>
                              updateConfig(option.key, e.target.value)
                            }
                            type='color'
                            value={config[option.key] as string}
                          />
                          <Input
                            className={cn(
                              'flex-1',
                              !option.changeable && 'opacity-50',
                            )}
                            disabled={!option.changeable}
                            onChange={(e) =>
                              updateConfig(option.key, e.target.value)
                            }
                            value={config[option.key] as string}
                          />
                        </div>
                      )}

                      <div className='flex items-start gap-2 rounded-md bg-muted/50 p-2'>
                        <Info className='mt-0.5 h-3 w-3 flex-shrink-0 text-muted-foreground' />
                        <div className='space-y-1'>
                          <p className='text-muted-foreground text-xs'>
                            {option.description}
                          </p>
                          <p className='font-medium text-muted-foreground text-xs'>
                            {option.changeable
                              ? 'Why changeable: '
                              : 'Why fixed: '}
                            {option.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Code Panel - Right Side */}
      <div className='space-y-6 lg:col-span-2'>
        <Card className='h-full'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Code2 className='h-5 w-5' />
              Embed Code
            </CardTitle>
            <CardDescription>
              Copy and paste this code into your website
            </CardDescription>
          </CardHeader>
          <CardContent className='h-full'>
            <Tabs className='flex h-full flex-col' defaultValue='script'>
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='script'>HTML Script</TabsTrigger>
                <TabsTrigger value='react'>React Component</TabsTrigger>
                <TabsTrigger value='types'>TypeScript</TabsTrigger>
              </TabsList>

              <TabsContent className='mt-4 flex-1' value='script'>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <p className='text-muted-foreground text-sm'>
                      Add this script tag to your HTML, preferably before the
                      closing &lt;/body&gt; tag
                    </p>
                    <Button
                      onClick={() => copyToClipboard(generateEmbedCode.script)}
                      size='sm'
                      variant='outline'
                    >
                      <Copy className='mr-2 h-4 w-4' />
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <Textarea
                    className='min-h-[300px] resize-none font-mono text-sm'
                    readOnly
                    value={generateEmbedCode.script}
                  />
                </div>
              </TabsContent>

              <TabsContent className='mt-4 flex-1' value='react'>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <p className='text-muted-foreground text-sm'>
                      Use this React component in your app
                    </p>
                    <Button
                      onClick={() => copyToClipboard(generateEmbedCode.react)}
                      size='sm'
                      variant='outline'
                    >
                      <Copy className='mr-2 h-4 w-4' />
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <Textarea
                    className='min-h-[300px] resize-none font-mono text-sm'
                    readOnly
                    value={generateEmbedCode.react}
                  />
                </div>
              </TabsContent>

              <TabsContent className='mt-4 flex-1' value='types'>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <p className='text-muted-foreground text-sm'>
                      TypeScript declarations for type safety
                    </p>
                    <Button
                      onClick={() => copyToClipboard(generateEmbedCode.types)}
                      size='sm'
                      variant='outline'
                    >
                      <Copy className='mr-2 h-4 w-4' />
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <Textarea
                    className='min-h-[300px] resize-none font-mono text-sm'
                    readOnly
                    value={generateEmbedCode.types}
                  />
                  <div className='rounded-md bg-muted/50 p-4'>
                    <p className='mb-2 font-semibold text-sm'>
                      TypeScript Setup Options:
                    </p>
                    <ul className='space-y-1 text-muted-foreground text-sm'>
                      <li>
                        • <strong>Copy the types above</strong> into your
                        project for immediate type safety
                      </li>
                      <li>
                        • <strong>No external dependencies</strong> - everything
                        is self-contained
                      </li>
                      <li>
                        • <strong>Works with any TypeScript setup</strong> -
                        just paste and go
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
