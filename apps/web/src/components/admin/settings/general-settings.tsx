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
import { PlusIcon } from "lucide-react";
import { useState } from "react";

interface FooterLink {
  id: string;
  label: string;
  url: string;
}

export function GeneralSettings() {
  const [workspaceName, setWorkspaceName] = useState("random-workspace-01");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [language, setLanguage] = useState("en");
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);

  const addFooterLink = () => {
    const newLink: FooterLink = {
      id: Date.now().toString(),
      label: "",
      url: "",
    };
    setFooterLinks([...footerLinks, newLink]);
  };

  const updateFooterLink = (
    id: string,
    field: "label" | "url",
    value: string,
  ) => {
    setFooterLinks(
      footerLinks.map((link) =>
        link.id === id ? { ...link, [field]: value } : link,
      ),
    );
  };

  const removeFooterLink = (id: string) => {
    setFooterLinks(footerLinks.filter((link) => link.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Workspace Section */}
      <Card className="bg-card border border-muted-foreground/10">
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>
            Workspace settings to tailor the branding, look, and feel of your
            public portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Workspace name *</Label>
            <Input
              id="workspace-name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="Enter workspace name"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="make-private">Make Workspace Private</Label>
              <p className="text-sm text-muted-foreground">
                Private workspaces are only accessible to team members.
              </p>
            </div>
            <Switch
              id="make-private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="read-only">Make workspace read only</Label>
              <p className="text-sm text-muted-foreground">
                User cannot submit any post to your workspace.
              </p>
            </div>
            <Switch
              id="read-only"
              checked={isReadOnly}
              onCheckedChange={setIsReadOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language Preference Section */}
      <Card className="bg-card border border-muted-foreground/10">
        <CardHeader>
          <CardTitle>Public hub language preference</CardTitle>
          <CardDescription>
            Select your preferred language to create a native Public Hub
            experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">🇬🇧 English</SelectItem>
              <SelectItem value="es">🇪🇸 Spanish</SelectItem>
              <SelectItem value="fr">🇫🇷 French</SelectItem>
              <SelectItem value="de">🇩🇪 German</SelectItem>
              <SelectItem value="it">🇮🇹 Italian</SelectItem>
              <SelectItem value="pt">🇵🇹 Portuguese</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Footer Links Section */}
      <Card className="bg-card border border-muted-foreground/10">
        <CardHeader>
          <CardTitle>Footer Links</CardTitle>
          <CardDescription>
            These links will help your users to connect with you or go to your
            website.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {footerLinks.map((link) => (
            <div key={link.id} className="flex items-center gap-3">
              <Input
                placeholder="Link label"
                value={link.label}
                onChange={(e) =>
                  updateFooterLink(link.id, "label", e.target.value)
                }
                className="flex-1"
              />
              <Input
                placeholder="https://example.com"
                value={link.url}
                onChange={(e) =>
                  updateFooterLink(link.id, "url", e.target.value)
                }
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeFooterLink(link.id)}
              >
                Remove
              </Button>
            </div>
          ))}

          <Button variant="outline" onClick={addFooterLink} className="w-full">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Link
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
