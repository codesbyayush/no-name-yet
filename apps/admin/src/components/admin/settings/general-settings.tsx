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
import { Switch } from '@workspace/ui/components/switch';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';

interface FooterLink {
  id: string;
  label: string;
  url: string;
}

export function GeneralSettings() {
  const [workspaceName, setWorkspaceName] = useState('random-workspace-01');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [language, setLanguage] = useState('en');
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);

  const addFooterLink = () => {
    const newLink: FooterLink = {
      id: Date.now().toString(),
      label: '',
      url: '',
    };
    setFooterLinks([...footerLinks, newLink]);
  };

  const updateFooterLink = (
    id: string,
    field: 'label' | 'url',
    value: string
  ) => {
    setFooterLinks(
      footerLinks.map((link) =>
        link.id === id ? { ...link, [field]: value } : link
      )
    );
  };

  const removeFooterLink = (id: string) => {
    setFooterLinks(footerLinks.filter((link) => link.id !== id));
  };

  return (
    <div className='space-y-8'>
      {/* Workspace Section */}
      <Card className='border border-muted-foreground/10 bg-card'>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>
            Workspace settings to tailor the branding, look, and feel of your
            public portal.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='workspace-name'>Workspace name *</Label>
            <Input
              id='workspace-name'
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder='Enter workspace name'
              value={workspaceName}
            />
          </div>

          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label htmlFor='make-private'>Make Workspace Private</Label>
              <p className='text-muted-foreground text-sm'>
                Private workspaces are only accessible to team members.
              </p>
            </div>
            <Switch
              checked={isPrivate}
              id='make-private'
              onCheckedChange={setIsPrivate}
            />
          </div>

          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label htmlFor='read-only'>Make workspace read only</Label>
              <p className='text-muted-foreground text-sm'>
                User cannot submit any post to your workspace.
              </p>
            </div>
            <Switch
              checked={isReadOnly}
              id='read-only'
              onCheckedChange={setIsReadOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language Preference Section */}
      <Card className='border border-muted-foreground/10 bg-card'>
        <CardHeader>
          <CardTitle>Public hub language preference</CardTitle>
          <CardDescription>
            Select your preferred language to create a native Public Hub
            experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setLanguage} value={language}>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select language' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='en'>🇬🇧 English</SelectItem>
              <SelectItem value='es'>🇪🇸 Spanish</SelectItem>
              <SelectItem value='fr'>🇫🇷 French</SelectItem>
              <SelectItem value='de'>🇩🇪 German</SelectItem>
              <SelectItem value='it'>🇮🇹 Italian</SelectItem>
              <SelectItem value='pt'>🇵🇹 Portuguese</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Footer Links Section */}
      <Card className='border border-muted-foreground/10 bg-card'>
        <CardHeader>
          <CardTitle>Footer Links</CardTitle>
          <CardDescription>
            These links will help your users to connect with you or go to your
            website.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {footerLinks.map((link) => (
            <div className='flex items-center gap-3' key={link.id}>
              <Input
                className='flex-1'
                onChange={(e) =>
                  updateFooterLink(link.id, 'label', e.target.value)
                }
                placeholder='Link label'
                value={link.label}
              />
              <Input
                className='flex-1'
                onChange={(e) =>
                  updateFooterLink(link.id, 'url', e.target.value)
                }
                placeholder='https://example.com'
                value={link.url}
              />
              <Button
                onClick={() => removeFooterLink(link.id)}
                size='sm'
                variant='outline'
              >
                Remove
              </Button>
            </div>
          ))}

          <Button className='w-full' onClick={addFooterLink} variant='outline'>
            <PlusIcon className='mr-2 h-4 w-4' />
            Add Link
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
