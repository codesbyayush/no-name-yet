import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Eye, Code2, Settings, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface WidgetConfig {
  organizationId: string;
  boardId?: string;
  theme: "light" | "dark" | "auto";
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  buttonColor: string;
  buttonText: string;
  showBranding: boolean;
  enableEmoji: boolean;
  enableScreenshot: boolean;
  autoOpen: boolean;
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
    type: "text" | "select" | "switch" | "color";
    options?: { label: string; value: string }[];
  }[];
}

export function WidgetEmbedCode() {
  const [config, setConfig] = useState<WidgetConfig>({
    organizationId: "org_123456789",
    boardId: "board_general",
    theme: "auto",
    position: "bottom-right",
    buttonColor: "#3b82f6",
    buttonText: "Feedback",
    showBranding: true,
    enableEmoji: true,
    enableScreenshot: true,
    autoOpen: false,
    customDomain: "",
  });

  const [copied, setCopied] = useState(false);

  const optionGroups: OptionGroup[] = [
    {
      title: "Core Configuration",
      description: "Essential settings for widget identification",
      options: [
        {
          key: "organizationId",
          label: "Organization ID",
          description: "Unique identifier for your organization",
          changeable: false,
          reason: "Auto-generated from your organization settings. Required for widget to connect to correct data.",
          type: "text",
        },
        {
          key: "boardId",
          label: "Board ID",
          description: "Which board should receive the feedback",
          changeable: true,
          reason: "You can select different boards to categorize feedback (e.g., bugs, features, general).",
          type: "select",
          options: [
            { label: "General Feedback", value: "board_general" },
            { label: "Bug Reports", value: "board_bugs" },
            { label: "Feature Requests", value: "board_features" },
          ],
        },
      ],
    },
    {
      title: "Appearance",
      description: "Visual customization options",
      options: [
        {
          key: "theme",
          label: "Theme",
          description: "Color scheme for the widget",
          changeable: true,
          reason: "Match your website's design. 'Auto' adapts to user's system preference.",
          type: "select",
          options: [
            { label: "Auto (System)", value: "auto" },
            { label: "Light", value: "light" },
            { label: "Dark", value: "dark" },
          ],
        },
        {
          key: "position",
          label: "Position",
          description: "Where the widget button appears on screen",
          changeable: true,
          reason: "Position based on your website layout to avoid conflicts with existing elements.",
          type: "select",
          options: [
            { label: "Bottom Right", value: "bottom-right" },
            { label: "Bottom Left", value: "bottom-left" },
            { label: "Top Right", value: "top-right" },
            { label: "Top Left", value: "top-left" },
          ],
        },
        {
          key: "buttonColor",
          label: "Button Color",
          description: "Primary color for the feedback button",
          changeable: true,
          reason: "Customize to match your brand colors for better integration.",
          type: "color",
        },
        {
          key: "buttonText",
          label: "Button Text",
          description: "Text displayed on the feedback button",
          changeable: true,
          reason: "Customize the call-to-action text. Keep it short for better mobile experience.",
          type: "text",
        },
      ],
    },
    {
      title: "Features",
      description: "Enable or disable widget functionality",
      options: [
        {
          key: "enableEmoji",
          label: "Emoji Reactions",
          description: "Allow users to react with emojis",
          changeable: true,
          reason: "Emojis provide quick feedback options. Disable if you prefer text-only feedback.",
          type: "switch",
        },
        {
          key: "enableScreenshot",
          label: "Screenshot Capture",
          description: "Allow users to attach screenshots",
          changeable: true,
          reason: "Screenshots help identify UI issues. May require additional permissions from users.",
          type: "switch",
        },
        {
          key: "autoOpen",
          label: "Auto Open",
          description: "Automatically open widget on page load",
          changeable: true,
          reason: "Can increase engagement but may be intrusive. Use sparingly.",
          type: "switch",
        },
      ],
    },
    {
      title: "Branding",
      description: "Control widget branding elements",
      options: [
        {
          key: "showBranding",
          label: "Show Powered By",
          description: "Display 'Powered by' text in widget",
          changeable: false,
          reason: "Required for free plan. Can be removed with premium subscription.",
          type: "switch",
        },
        {
          key: "customDomain",
          label: "Custom Domain",
          description: "Use your own domain for the widget",
          changeable: false,
          reason: "Available with enterprise plan. Requires DNS configuration and SSL setup.",
          type: "text",
        },
      ],
    },
  ];

  const generateEmbedCode = useMemo(() => {
    const configString = JSON.stringify(
      {
        organizationId: config.organizationId,
        ...(config.boardId && { boardId: config.boardId }),
        theme: config.theme,
        position: config.position,
        buttonColor: config.buttonColor,
        buttonText: config.buttonText,
        showBranding: config.showBranding,
        enableEmoji: config.enableEmoji,
        enableScreenshot: config.enableScreenshot,
        autoOpen: config.autoOpen,
        ...(config.customDomain && { customDomain: config.customDomain }),
      },
      null,
      2
    );

    const domain = config.customDomain || "widget.yourdomain.com";

    return {
      script: `<!-- Feedback Widget -->
<script>
  window.FeedbackWidget = ${configString};
</script>
<script src="https://${domain}/widget.js" async></script>`,

      react: `import { useEffect } from 'react';

const FeedbackWidget = () => {
  useEffect(() => {
    // Initialize widget
    window.FeedbackWidget = ${configString};

    // Load widget script
    const script = document.createElement('script');
    script.src = 'https://${domain}/widget.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      document.head.removeChild(script);
      delete window.FeedbackWidget;
    };
  }, []);

  return null;
};

export default FeedbackWidget;`,

      npm: `# Install the widget package
npm install @yourdomain/feedback-widget

# Or with yarn
yarn add @yourdomain/feedback-widget`,
    };
  }, [config]);

  const updateConfig = (key: keyof WidgetConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Options Panel - Left Side */}
      <div className="lg:col-span-1 space-y-6 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Widget Configuration
            </CardTitle>
            <CardDescription>
              Customize your widget settings and appearance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {optionGroups.map((group) => (
              <div key={group.title} className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm">{group.title}</h3>
                  <p className="text-xs text-muted-foreground">{group.description}</p>
                </div>

                <div className="space-y-4">
                  {group.options.map((option) => (
                    <div key={option.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={option.key} className="text-sm">
                          {option.label}
                        </Label>
                        <Badge
                          variant={option.changeable ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {option.changeable ? "Editable" : "Fixed"}
                        </Badge>
                      </div>

                      {option.type === "text" && (
                        <Input
                          id={option.key}
                          value={config[option.key] as string}
                          onChange={(e) => updateConfig(option.key, e.target.value)}
                          disabled={!option.changeable}
                          className={cn(!option.changeable && "opacity-50")}
                        />
                      )}

                      {option.type === "select" && (
                        <Select
                          value={config[option.key] as string}
                          onValueChange={(value) => updateConfig(option.key, value)}
                          disabled={!option.changeable}
                        >
                          <SelectTrigger className={cn(!option.changeable && "opacity-50")}>
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

                      {option.type === "switch" && (
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={option.key}
                            checked={config[option.key] as boolean}
                            onCheckedChange={(checked) => updateConfig(option.key, checked)}
                            disabled={!option.changeable}
                          />
                          <Label htmlFor={option.key} className="text-sm">
                            {(config[option.key] as boolean) ? "Enabled" : "Disabled"}
                          </Label>
                        </div>
                      )}

                      {option.type === "color" && (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="color"
                            value={config[option.key] as string}
                            onChange={(e) => updateConfig(option.key, e.target.value)}
                            disabled={!option.changeable}
                            className="w-12 h-8 p-1 rounded border"
                          />
                          <Input
                            value={config[option.key] as string}
                            onChange={(e) => updateConfig(option.key, e.target.value)}
                            disabled={!option.changeable}
                            className={cn("flex-1", !option.changeable && "opacity-50")}
                          />
                        </div>
                      )}

                      <div className="flex items-start gap-2 p-2 bg-muted/50 rounded-md">
                        <Info className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                          <p className="text-xs text-muted-foreground font-medium">
                            {option.changeable ? "Why changeable: " : "Why fixed: "}
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
      <div className="lg:col-span-2 space-y-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Embed Code
            </CardTitle>
            <CardDescription>
              Copy and paste this code into your website
            </CardDescription>
          </CardHeader>
          <CardContent className="h-full">
            <Tabs defaultValue="script" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="script">HTML Script</TabsTrigger>
                <TabsTrigger value="react">React Component</TabsTrigger>
                <TabsTrigger value="npm">NPM Package</TabsTrigger>
              </TabsList>

              <TabsContent value="script" className="flex-1 mt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Add this script tag to your HTML, preferably before the closing &lt;/body&gt; tag
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generateEmbedCode.script)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <Textarea
                    value={generateEmbedCode.script}
                    readOnly
                    className="font-mono text-sm min-h-[300px] resize-none"
                  />
                </div>
              </TabsContent>

              <TabsContent value="react" className="flex-1 mt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Use this React component in your app
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generateEmbedCode.react)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <Textarea
                    value={generateEmbedCode.react}
                    readOnly
                    className="font-mono text-sm min-h-[300px] resize-none"
                  />
                </div>
              </TabsContent>

              <TabsContent value="npm" className="flex-1 mt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Install and use our NPM package for better integration
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generateEmbedCode.npm)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <Textarea
                    value={generateEmbedCode.npm}
                    readOnly
                    className="font-mono text-sm min-h-[100px] resize-none"
                  />
                  <div className="p-4 bg-muted/50 rounded-md">
                    <p className="text-sm font-semibold mb-2">NPM Package Benefits:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• TypeScript support</li>
                      <li>• Better integration with build tools</li>
                      <li>• Automatic updates</li>
                      <li>• Tree-shaking support</li>
                      <li>• Better error handling</li>
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
